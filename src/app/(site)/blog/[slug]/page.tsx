import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Icon } from "@iconify/react/dist/iconify.js";
import { blogsData, siteConfig } from "@/data";
import { db } from "@/lib/db";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const dbBlogs = await db.blog.findMany({
      where: { status: "PUBLISHED", isDeleted: false },
      select: { slug: true },
    });
    if (dbBlogs.length > 0) {
      return dbBlogs.map((b) => ({ slug: b.slug }));
    }
  } catch (err) {
    console.error("Error fetching static blog params:", err);
  }
  return blogsData.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const dbPost = await db.blog.findUnique({ where: { slug } });
  const post = dbPost
    ? {
        title: dbPost.metaTitle || dbPost.title,
        excerpt: dbPost.metaDescription || dbPost.content.substring(0, 150),
        slug: dbPost.slug,
      }
    : blogsData.find((p) => p.slug === slug);

  if (!post) return { title: "Post Not Found" };
  return {
    title: `${post.title} – ${siteConfig.name}`,
    description: post.excerpt,
    alternates: { canonical: `https://www.qimd.in/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
    },
  };
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function formatInlineText(text: string) {
  if (!text) return "";
  // Strip any accidental leading markdown hashes and normalize dashes
  const cleaned = text
    .replace(/^#+\s*/, "")
    .replace(/—|–/g, " - ")
    .replace(/--+/g, " - ");

  // Tokenize markdown bold and markdown links
  const regex = /(\[.*?\]\(.*?\)|\*\*.*?\*\*)/g;
  const parts = cleaned.split(regex);

  return parts.map((part, i) => {
    if (part.startsWith("[") && part.includes("](") && part.endsWith(")")) {
      const match = part.match(/^\[(.*?)\]\((.*?)\)$/);
      if (match) {
        const linkText = match[1];
        let linkHref = match[2];
        if (linkHref.startsWith("https://quickuppinstitute.com")) {
          linkHref = linkHref.replace("https://quickuppinstitute.com", "") || "/";
        }
        return (
          <Link
            key={i}
            href={linkHref}
            className="text-blue-600 hover:text-blue-800 underline font-medium"
          >
            {linkText}
          </Link>
        );
      }
    }
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-bold text-slate-900 dark:text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

interface ParsedBlock {
  type: "h2" | "h3" | "paragraph" | "list" | "date";
  title?: string;
  id?: string;
  content?: string;
  items?: string[];
}

function parseBlogContent(rawContent: string) {
  if (!rawContent) return { toc: [], blocks: [] };

  const normalized = rawContent
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/—|–/g, " - ")
    .replace(/--+/g, " - ");

  const lines = normalized.split("\n");
  const toc: { title: string; id: string }[] = [];
  const blocks: ParsedBlock[] = [];

  let currentListItems: string[] = [];

  function flushList() {
    if (currentListItems.length > 0) {
      blocks.push({
        type: "list",
        items: [...currentListItems],
      });
      currentListItems = [];
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      flushList();
      continue;
    }

    // Check for H2 Heading
    if (line.startsWith("## ")) {
      flushList();
      const headingText = line.replace(/^##\s+/, "").trim();
      const id = slugify(headingText);
      toc.push({ title: headingText, id });
      blocks.push({ type: "h2", title: headingText, id });
      continue;
    }

    // Check for H3 Heading (e.g. FAQ questions)
    if (line.startsWith("### ")) {
      flushList();
      const h3Text = line.replace(/^###\s+/, "").trim();
      const id = slugify(h3Text);
      blocks.push({ type: "h3", title: h3Text, id });
      continue;
    }

    // Check for Numbered FAQ Questions (e.g. "01. What is...")
    if (/^\d{2}\.\s+/.test(line)) {
      flushList();
      const id = slugify(line);
      blocks.push({ type: "h3", title: line, id });
      continue;
    }

    // Check for Bullet points (*, -, •)
    if (line.startsWith("* ") || line.startsWith("- ") || line.startsWith("• ")) {
      const itemText = line.replace(/^[\*\-\•]\s+/, "").trim();
      currentListItems.push(itemText);
      continue;
    }

    // Check for Date lines (e.g. "Sep 01, 2026")
    if (/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},\s+\d{4}$/i.test(line)) {
      flushList();
      blocks.push({
        type: "date",
        content: line,
      });
      continue;
    }

    // Regular Paragraph
    flushList();
    blocks.push({
      type: "paragraph",
      content: line,
    });
  }

  flushList();
  return { toc, blocks };
}

export default async function BlogDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const dbPost = await db.blog.findUnique({ where: { slug } });

  const post = dbPost
    ? {
        id: dbPost.id,
        title: dbPost.title,
        slug: dbPost.slug,
        category: dbPost.category || "Blog Article",
        author: dbPost.author || "QIMD Institute",
        readTime: `${dbPost.readingTime} min read`,
        publishedAt: dbPost.createdAt.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        updatedAt: dbPost.updatedAt
          ? dbPost.updatedAt.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : null,
        isEdited: dbPost.updatedAt && dbPost.updatedAt > dbPost.createdAt,
        coverImage: dbPost.featuredImage || "/images/blog/blog-1.jpg",
        excerpt: dbPost.metaDescription || (dbPost.content ? dbPost.content.substring(0, 160) + "..." : ""),
        content: dbPost.content,
        tags: Array.isArray(dbPost.tags) ? (dbPost.tags as string[]) : ["QIMD", "Industry Insights"],
      }
    : blogsData.find((p) => p.slug === slug);

  if (!post) notFound();

  const allBlogs = await db.blog
    .findMany({
      where: { status: "PUBLISHED", isDeleted: false },
      select: { id: true, title: true, slug: true, category: true, featuredImage: true },
    })
    .catch(() => []);

  const relatedPosts = (allBlogs.length > 0 ? allBlogs : blogsData)
    .filter((p) => p.slug !== post.slug)
    .slice(0, 3);

  const heroImage = post.coverImage || "/images/courses/digital-marketing.jpg";
  const { toc, blocks } = parseBlogContent(post.content || "");

  return (
    <>
      <section className="section-py bg-grey dark:bg-dark">
        <div className="container mx-auto lg:max-w-(--breakpoint-xl) md:max-w-(--breakpoint-md) px-4">
          
          {/* Breadcrumb Navigation */}
          <nav className="mb-4 flex items-center gap-1.5 text-xs text-muted dark:text-white/60 font-medium">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <Icon icon="ion:chevron-forward" className="text-slate-400 text-xs" />
            <Link href="/blog" className="hover:text-primary transition-colors">Blogs</Link>
            <Icon icon="ion:chevron-forward" className="text-slate-400 text-xs" />
            <span className="text-slate-700 dark:text-white/90 font-semibold truncate max-w-xs sm:max-w-md">{post.title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Blog Article Container */}
            <article className="lg:col-span-8 bg-white dark:bg-darklight rounded-2xl p-6 sm:p-9 shadow-xs border border-border dark:border-dark_border">
              
              {/* Featured Cover Image */}
              {heroImage && (
                <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] rounded-xl overflow-hidden mb-6 border border-border/60 dark:border-dark_border/60 shadow-xs">
                  <Image
                    src={heroImage}
                    alt={post.title}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 800px"
                    className="object-cover"
                  />
                </div>
              )}

              {/* Meta Info Row */}
              <div className="flex flex-wrap items-center gap-2.5 mb-3 text-xs">
                <span className="bg-primary/10 text-primary dark:text-amber-400 font-bold px-3 py-1 rounded-full text-[11px]">
                  {post.category}
                </span>
                {post.readTime && (
                  <span className="text-muted dark:text-white/60 flex items-center gap-1">
                    <Icon icon="mdi:clock-outline" /> {post.readTime}
                  </span>
                )}
                {post.publishedAt && (
                  <span className="text-muted dark:text-white/60 flex items-center gap-1">
                    <Icon icon="mdi:calendar-outline" /> {post.publishedAt}
                  </span>
                )}
                {(post as any).isEdited && (post as any).updatedAt && (
                  <span className="text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Icon icon="mdi:pencil-outline" className="text-xs" /> Updated: {(post as any).updatedAt}
                  </span>
                )}
              </div>

              {/* Title (Compact & bold matching Google Doc) */}
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-6 leading-snug">
                {post.title}
              </h1>

              {/* ─── TABLE OF CONTENTS (Blue Heading & Bullet links as in Google Docs) ─── */}
              {toc.length > 0 && (
                <div className="mb-8 pt-2">
                  <h2 className="text-base sm:text-lg font-bold text-blue-600 dark:text-blue-400 underline mb-3">
                    Table of Contents
                  </h2>
                  <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                    {toc.map((item) => (
                      <li key={item.id}>
                        <a
                          href={`#${item.id}`}
                          className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors underline decoration-slate-300 dark:decoration-slate-600 underline-offset-2"
                        >
                          {item.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                  <hr className="my-6 border-slate-300 dark:border-dark_border" />
                </div>
              )}

              {/* ─── ARTICLE BODY BLOCKS (Exact document layout & bullet points) ─── */}
              <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-200 font-normal">
                {blocks.map((block, idx) => {
                  
                  // Section H2 Heading
                  if (block.type === "h2") {
                    return (
                      <div key={idx} id={block.id} className="pt-5 scroll-mt-24">
                        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                          {formatInlineText(block.title || "")}
                        </h2>
                      </div>
                    );
                  }

                  // Section H3 / FAQ Question
                  if (block.type === "h3") {
                    return (
                      <div key={idx} id={block.id} className="pt-3 scroll-mt-24">
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug">
                          {formatInlineText(block.title || "")}
                        </h3>
                      </div>
                    );
                  }

                  // Bulleted List (Clean bullet points matching Google Docs)
                  if (block.type === "list" && block.items) {
                    return (
                      <ul key={idx} className="list-disc pl-5 space-y-1.5 my-3 text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                        {block.items.map((item, itemIdx) => {
                          const boldMatch = item.match(/^\*\*(.*?)\*\*:\s*(.*)$/);
                          return (
                            <li key={itemIdx} className="leading-relaxed">
                              {boldMatch ? (
                                <>
                                  <strong className="font-bold text-slate-900 dark:text-white">{boldMatch[1]}: </strong>
                                  <span>{formatInlineText(boldMatch[2])}</span>
                                </>
                              ) : (
                                formatInlineText(item)
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    );
                  }

                  // Date Line (e.g. Sep 01, 2026)
                  if (block.type === "date") {
                    return (
                      <p key={idx} className="text-xs italic text-slate-500 dark:text-slate-400 my-1">
                        {block.content}
                      </p>
                    );
                  }

                  // Regular Paragraph
                  if (block.type === "paragraph" && block.content) {
                    return (
                      <p key={idx} className="leading-relaxed">
                        {formatInlineText(block.content)}
                      </p>
                    );
                  }

                  return null;
                })}
              </div>

              {/* Topics & Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="mt-8 pt-4 border-t border-slate-100 dark:border-dark_border flex flex-wrap gap-1.5 items-center text-xs">
                  <span className="font-bold text-slate-900 dark:text-white mr-1 text-[11px]">Topics:</span>
                  {post.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-[11px] bg-slate-100 dark:bg-dark text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-full border border-slate-200 dark:border-dark_border"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </article>

            {/* Sidebar */}
            <aside className="lg:col-span-4 space-y-5">
              <div className="sticky top-24 space-y-5">
                
                {/* Course Enquiry CTA Box */}
                <div className="bg-slate-900 dark:bg-darklight rounded-2xl p-5 text-white border border-slate-800 shadow-md">
                  <span className="inline-block bg-primary/20 text-cyan-300 font-bold text-[10px] px-2.5 py-0.5 rounded-full mb-2.5 uppercase tracking-wider">
                    Practical Training
                  </span>
                  <h3 className="font-bold text-sm sm:text-base mb-1.5">Interested in {post.category}?</h3>
                  <p className="text-white/80 text-xs mb-4 leading-relaxed">
                    Join QIMD&apos;s offline classroom training in Hinjewadi, Pune. Work on live client projects with mentor access.
                  </p>
                  <Link
                    href="/courses"
                    className="block text-center bg-secondary hover:bg-amber-400 text-midnight_text font-bold py-2.5 rounded-xl text-xs transition-all shadow-xs"
                  >
                    Explore Our Courses
                  </Link>
                </div>

                {/* Related Articles Box */}
                {relatedPosts.length > 0 && (
                  <div className="bg-white dark:bg-darklight rounded-2xl p-4 sm:p-5 shadow-xs border border-border dark:border-dark_border">
                    <h4 className="font-bold text-slate-900 dark:text-white mb-3 text-xs sm:text-sm flex items-center gap-1.5">
                      <Icon icon="ion:newspaper-outline" className="text-primary text-base" />
                      <span>Other Guides &amp; Articles</span>
                    </h4>
                    <div className="space-y-3">
                      {relatedPosts.map((related) => {
                        const relatedImg = (related as any).featuredImage || (related as any).coverImage || "/images/courses/digital-marketing.jpg";
                        return (
                          <Link
                            key={related.id || related.slug}
                            href={`/blog/${related.slug}`}
                            className="flex gap-2.5 group items-center"
                          >
                            <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-slate-900 shrink-0 border border-slate-200 dark:border-slate-800">
                              <Image
                                src={relatedImg}
                                alt={related.title}
                                fill
                                sizes="56px"
                                className="object-cover group-hover:scale-105 transition-transform"
                              />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-800 dark:text-white group-hover:text-primary dark:group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
                                {related.title}
                              </p>
                              <p className="text-[10px] text-muted dark:text-white/50 mt-0.5">{related.category}</p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Free Counselling CTA */}
                <div className="bg-white dark:bg-darklight rounded-2xl p-4 sm:p-5 shadow-xs border border-border dark:border-dark_border text-center space-y-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto text-base">
                    <Icon icon="ion:headset-outline" />
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">Need Career Advice?</h4>
                  <p className="text-[11px] text-muted dark:text-white/70 leading-relaxed">
                    Talk to our senior career mentors to choose the right track for your goals.
                  </p>
                  <Link
                    href="/contact"
                    className="inline-block w-full py-2 px-3 rounded-xl border border-primary text-primary hover:bg-primary hover:text-white text-xs font-semibold transition-all"
                  >
                    Book Free Counselling
                  </Link>
                </div>

              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}