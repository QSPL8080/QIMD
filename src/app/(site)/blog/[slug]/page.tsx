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

interface ParsedSection {
  type: "summary" | "takeaways" | "h2" | "h3" | "paragraph" | "list" | "faq_group";
  title?: string;
  id?: string;
  content?: string;
  items?: string[];
  faqs?: { question: string; answer: string; id: string }[];
}

function parseBlogContent(rawContent: string) {
  if (!rawContent) return { toc: [], sections: [] };

  // 1. Normalize line endings (handling CRLF from Windows/DB)
  const normalized = rawContent.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const rawBlocks = normalized.split(/\n{2,}/);

  const toc: { number: string; title: string; id: string }[] = [];
  const sections: ParsedSection[] = [];

  let tocIndex = 1;
  let isInFaqMode = false;
  let currentFaqList: { question: string; answer: string; id: string }[] = [];

  for (let i = 0; i < rawBlocks.length; i++) {
    const block = rawBlocks[i].trim();
    if (!block) continue;

    // Check for H2 Heading
    if (block.startsWith("## ")) {
      const headingText = block.replace(/^##\s+/, "").trim();
      const id = slugify(headingText);

      // If we were collecting FAQs, flush them before starting a new H2
      if (isInFaqMode && currentFaqList.length > 0) {
        sections.push({
          type: "faq_group",
          faqs: [...currentFaqList],
        });
        currentFaqList = [];
        isInFaqMode = false;
      }

      // Add to Table of Contents
      toc.push({
        number: String(tocIndex).padStart(2, "0"),
        title: headingText,
        id,
      });
      tocIndex++;

      // Check if this is the Frequently Asked Questions section
      if (headingText.toLowerCase().includes("frequently asked questions") || headingText.toLowerCase().includes("faq")) {
        isInFaqMode = true;
        sections.push({
          type: "h2",
          title: headingText,
          id,
        });
        continue;
      }

      // Check if this is Summary section
      if (headingText.toLowerCase() === "summary") {
        // Look ahead for the summary paragraph
        if (i + 1 < rawBlocks.length && !rawBlocks[i + 1].startsWith("## ")) {
          const summaryText = rawBlocks[i + 1].trim();
          sections.push({
            type: "summary",
            title: "Summary",
            id,
            content: summaryText,
          });
          i++; // Skip next block since it's consumed as summary text
          continue;
        }
      }

      // Check if this is Key Takeaways section
      if (headingText.toLowerCase().includes("key takeaways")) {
        // Look ahead for bullet list
        if (i + 1 < rawBlocks.length && !rawBlocks[i + 1].startsWith("## ")) {
          const takeawaysBlock = rawBlocks[i + 1].trim();
          const items = takeawaysBlock
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line.startsWith("* ") || line.startsWith("- "))
            .map((line) => line.replace(/^[\*\-]\s+/, ""));

          if (items.length > 0) {
            sections.push({
              type: "takeaways",
              title: headingText,
              id,
              items,
            });
            i++; // Skip next block since consumed
            continue;
          }
        }
      }

      // Standard H2
      sections.push({
        type: "h2",
        title: headingText,
        id,
      });
      continue;
    }

    // Check for H3 Heading (e.g. FAQ questions like "### 01. Do I need...")
    if (block.startsWith("### ")) {
      const h3Text = block.replace(/^###\s+/, "").trim();
      const id = slugify(h3Text);

      // If we are in FAQ mode, check if the next block is the answer
      if (isInFaqMode) {
        let answerText = "";
        if (i + 1 < rawBlocks.length && !rawBlocks[i + 1].startsWith("## ") && !rawBlocks[i + 1].startsWith("### ")) {
          answerText = rawBlocks[i + 1].trim();
          i++; // Skip the answer block
        }
        currentFaqList.push({
          question: h3Text,
          answer: answerText,
          id,
        });
        continue;
      }

      sections.push({
        type: "h3",
        title: h3Text,
        id,
      });
      continue;
    }

    // Check for Bulleted List
    if (block.startsWith("* ") || block.startsWith("- ")) {
      const items = block
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.startsWith("* ") || line.startsWith("- "))
        .map((line) => line.replace(/^[\*\-]\s+/, ""));

      sections.push({
        type: "list",
        items,
      });
      continue;
    }

    // Standard Paragraph
    sections.push({
      type: "paragraph",
      content: block,
    });
  }

  // Flush any remaining FAQs
  if (isInFaqMode && currentFaqList.length > 0) {
    sections.push({
      type: "faq_group",
      faqs: [...currentFaqList],
    });
  }

  return { toc, sections };
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
  const { toc, sections } = parseBlogContent(post.content || "");

  return (
    <>
      <section className="section-py bg-grey dark:bg-dark">
        <div className="container mx-auto lg:max-w-(--breakpoint-xl) md:max-w-(--breakpoint-md) px-4">
          
          {/* Breadcrumb Navigation */}
          <nav className="mb-6 flex items-center gap-2 text-xs text-muted dark:text-white/60 font-medium">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <Icon icon="ion:chevron-forward" className="text-slate-400 text-xs" />
            <Link href="/blog" className="hover:text-primary transition-colors">Blogs</Link>
            <Icon icon="ion:chevron-forward" className="text-slate-400 text-xs" />
            <span className="text-slate-700 dark:text-white/90 font-bold truncate max-w-xs sm:max-w-md">{post.title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Main Blog Article */}
            <article className="lg:col-span-8 bg-white dark:bg-darklight rounded-3xl p-6 sm:p-10 shadow-sm border border-border dark:border-dark_border">
              
              {/* Featured Cover Image */}
              {heroImage && (
                <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] rounded-2xl overflow-hidden mb-8 border border-border/60 dark:border-dark_border/60 shadow-md">
                  <Image
                    src={heroImage}
                    alt={post.title}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 800px"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                </div>
              )}

              {/* Meta Row with Category & Live Edited/Published Dates */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="bg-primary/10 text-primary dark:text-amber-400 font-bold text-xs px-3.5 py-1.5 rounded-full">
                  {post.category}
                </span>
                {post.readTime && (
                  <span className="text-xs text-muted dark:text-white/60 flex items-center gap-1">
                    <Icon icon="mdi:clock-outline" /> {post.readTime}
                  </span>
                )}
                {post.publishedAt && (
                  <span className="text-xs text-muted dark:text-white/60 flex items-center gap-1">
                    <Icon icon="mdi:calendar-outline" /> Published: {post.publishedAt}
                  </span>
                )}
                {(post as any).isEdited && (post as any).updatedAt && (
                  <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Icon icon="mdi:pencil-outline" className="text-xs" /> Updated: {(post as any).updatedAt}
                  </span>
                )}
              </div>

              {/* Article Headline */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-midnight_text dark:text-white mb-6 leading-tight">
                {post.title}
              </h1>

              {/* Author Info */}
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-border dark:border-dark_border">
                <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                  <Icon icon="mdi:school-outline" className="text-2xl" />
                </div>
                <div>
                  <p className="font-bold text-sm text-midnight_text dark:text-white">{post.author}</p>
                  <p className="text-xs text-muted dark:text-white/60">Faculty &amp; Industry Mentor Network</p>
                </div>
              </div>

              {/* ─── TABLE OF CONTENTS (INTERACTIVE TABLE) ─── */}
              {toc.length > 0 && (
                <div className="mb-10 p-6 sm:p-7 rounded-2xl bg-slate-50 dark:bg-dark border border-slate-200 dark:border-dark_border">
                  <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-200 dark:border-dark_border">
                    <Icon icon="ion:list-outline" className="text-primary text-2xl" />
                    <h2 className="text-lg font-extrabold text-midnight_text dark:text-white">
                      Table of Contents
                    </h2>
                  </div>

                  {/* Clean Table of Contents Grid/Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead>
                        <tr className="text-slate-400 dark:text-white/40 uppercase tracking-wider text-[11px] border-b border-slate-200 dark:border-dark_border">
                          <th className="pb-2 w-12 font-bold">#</th>
                          <th className="pb-2 font-bold">Topic / Section</th>
                          <th className="pb-2 text-right font-bold">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                        {toc.map((item) => (
                          <tr key={item.id} className="group hover:bg-slate-100/60 dark:hover:bg-white/5 transition-colors">
                            <td className="py-2.5 font-mono text-xs font-bold text-primary dark:text-amber-400">
                              {item.number}
                            </td>
                            <td className="py-2.5 font-medium text-slate-700 dark:text-white/80 group-hover:text-primary dark:group-hover:text-amber-400 transition-colors">
                              <a href={`#${item.id}`} className="block">
                                {item.title}
                              </a>
                            </td>
                            <td className="py-2.5 text-right">
                              <a
                                href={`#${item.id}`}
                                className="inline-flex items-center gap-1 text-xs text-primary dark:text-amber-400 font-bold hover:underline"
                              >
                                <span>Jump</span>
                                <Icon icon="ion:arrow-down" className="text-xs" />
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ─── ARTICLE STRUCTURED CONTENT ─── */}
              <div className="blog-content space-y-7 text-slate-700 dark:text-white/80 text-sm sm:text-base leading-relaxed">
                {sections.map((sec, idx) => {
                  
                  // Summary Callout Box
                  if (sec.type === "summary") {
                    return (
                      <div
                        key={idx}
                        id={sec.id}
                        className="p-6 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 shadow-2xs space-y-2 scroll-mt-24"
                      >
                        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-bold text-sm sm:text-base">
                          <Icon icon="mdi:text-box-outline" className="text-xl" />
                          <span>Summary Overview</span>
                        </div>
                        <p className="text-slate-700 dark:text-white/90 text-sm sm:text-base leading-relaxed font-medium">
                          {sec.content}
                        </p>
                      </div>
                    );
                  }

                  // Key Takeaways Highlight Box
                  if (sec.type === "takeaways" && sec.items) {
                    return (
                      <div
                        key={idx}
                        id={sec.id}
                        className="p-6 sm:p-7 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 shadow-2xs space-y-4 scroll-mt-24"
                      >
                        <div className="flex items-center gap-2.5 text-amber-800 dark:text-amber-400 font-extrabold text-base sm:text-lg border-b border-amber-200/60 dark:border-amber-900/40 pb-3">
                          <Icon icon="mdi:lightbulb-on" className="text-amber-500 text-2xl shrink-0" />
                          <span>{sec.title || "Key Takeaways"}</span>
                        </div>
                        <ul className="space-y-3 pl-1">
                          {sec.items.map((item, itemIdx) => (
                            <li key={itemIdx} className="flex items-start gap-3">
                              <Icon icon="mdi:check-circle" className="text-emerald-500 text-lg mt-0.5 shrink-0" />
                              <span className="text-slate-800 dark:text-white/90 font-medium text-xs sm:text-sm leading-relaxed">
                                {item}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  }

                  // H2 Section Heading
                  if (sec.type === "h2") {
                    return (
                      <div key={idx} id={sec.id} className="pt-8 border-t border-slate-200/80 dark:border-dark_border scroll-mt-24">
                        <h2 className="text-xl sm:text-2xl font-extrabold text-midnight_text dark:text-white leading-snug">
                          {sec.title}
                        </h2>
                      </div>
                    );
                  }

                  // H3 Section Heading
                  if (sec.type === "h3") {
                    return (
                      <div key={idx} id={sec.id} className="pt-4 scroll-mt-24">
                        <h3 className="text-base sm:text-lg font-bold text-midnight_text dark:text-white leading-snug">
                          {sec.title}
                        </h3>
                      </div>
                    );
                  }

                  // Bulleted Lists (with **bold label**: detail parsing)
                  if (sec.type === "list" && sec.items) {
                    return (
                      <ul key={idx} className="space-y-3 pl-2 my-4">
                        {sec.items.map((item, itemIdx) => {
                          const boldMatch = item.match(/^\*\*(.*?)\*\*:\s*(.*)$/);
                          return (
                            <li key={itemIdx} className="flex items-start gap-3 text-sm sm:text-base">
                              <span className="w-2 h-2 rounded-full bg-primary dark:bg-amber-400 mt-2 shrink-0" />
                              <span className="leading-relaxed">
                                {boldMatch ? (
                                  <>
                                    <strong className="text-midnight_text dark:text-white font-bold">{boldMatch[1]}: </strong>
                                    <span>{boldMatch[2]}</span>
                                  </>
                                ) : (
                                  item
                                )}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    );
                  }

                  // Standard Paragraph
                  if (sec.type === "paragraph" && sec.content) {
                    return (
                      <p key={idx} className="leading-relaxed text-sm sm:text-base">
                        {sec.content}
                      </p>
                    );
                  }

                  // FAQ Group Cards
                  if (sec.type === "faq_group" && sec.faqs) {
                    return (
                      <div key={idx} className="space-y-4 pt-2">
                        {sec.faqs.map((faq, fIdx) => (
                          <div
                            key={fIdx}
                            id={faq.id}
                            className="p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-dark border border-slate-200 dark:border-dark_border space-y-2.5 transition-all hover:border-primary/40 scroll-mt-24"
                          >
                            <h3 className="text-sm sm:text-base font-bold text-midnight_text dark:text-white flex items-start gap-2.5">
                              <span className="text-primary dark:text-amber-400 font-extrabold shrink-0">Q.</span>
                              <span>{faq.question}</span>
                            </h3>
                            {faq.answer && (
                              <p className="text-xs sm:text-sm text-slate-600 dark:text-white/75 leading-relaxed pl-5">
                                {faq.answer}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  }

                  return null;
                })}
              </div>

              {/* Topics & Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="mt-12 pt-6 border-t border-border dark:border-dark_border flex flex-wrap gap-2 items-center">
                  <span className="text-xs font-bold text-midnight_text dark:text-white mr-2">Topics:</span>
                  {post.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-xs bg-slate-100 dark:bg-dark text-midnight_text dark:text-white/70 px-3 py-1.5 rounded-full border border-border/50 dark:border-dark_border/50"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </article>

            {/* Sidebar */}
            <aside className="lg:col-span-4 space-y-6">
              <div className="sticky top-24 space-y-6">
                
                {/* Course Enquiry CTA Box */}
                <div className="bg-slate-900 dark:bg-darklight rounded-2xl p-6 text-white border border-slate-800 shadow-lg">
                  <span className="inline-block bg-primary/20 text-cyan-300 font-bold text-[11px] px-3 py-1 rounded-full mb-3 uppercase tracking-wider">
                    Practical Training
                  </span>
                  <h3 className="font-extrabold text-lg mb-2">Interested in Learning {post.category}?</h3>
                  <p className="text-white/80 text-xs sm:text-sm mb-5 leading-relaxed">
                    Join QIMD&apos;s offline classroom training in Hinjewadi, Pune. Work on live client projects with mentor access.
                  </p>
                  <Link
                    href="/courses"
                    className="block text-center bg-secondary hover:bg-amber-400 text-midnight_text font-extrabold py-3 rounded-xl text-xs sm:text-sm transition-all shadow"
                  >
                    Explore Our Courses
                  </Link>
                </div>

                {/* Related Articles Box */}
                {relatedPosts.length > 0 && (
                  <div className="bg-white dark:bg-darklight rounded-2xl p-5 shadow-sm border border-border dark:border-dark_border">
                    <h4 className="font-extrabold text-midnight_text dark:text-white mb-4 text-sm sm:text-base flex items-center gap-2">
                      <Icon icon="ion:newspaper-outline" className="text-primary" />
                      <span>Other Guides &amp; Articles</span>
                    </h4>
                    <div className="space-y-4">
                      {relatedPosts.map((related) => {
                        const relatedImg = (related as any).featuredImage || (related as any).coverImage || "/images/courses/digital-marketing.jpg";
                        return (
                          <Link
                            key={related.id || related.slug}
                            href={`/blog/${related.slug}`}
                            className="flex gap-3 group items-center"
                          >
                            <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-border/50">
                              <Image
                                src={relatedImg}
                                alt={related.title}
                                fill
                                sizes="64px"
                                className="object-cover group-hover:scale-105 transition-transform"
                              />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-midnight_text dark:text-white group-hover:text-primary dark:group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
                                {related.title}
                              </p>
                              <p className="text-[11px] text-muted dark:text-white/50 mt-1 font-medium">{related.category}</p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Free Counselling CTA */}
                <div className="bg-white dark:bg-darklight rounded-2xl p-5 shadow-sm border border-border dark:border-dark_border text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto text-xl">
                    <Icon icon="ion:headset-outline" />
                  </div>
                  <h4 className="font-bold text-sm text-midnight_text dark:text-white">Need Career Advice?</h4>
                  <p className="text-xs text-muted dark:text-white/70">
                    Talk to our senior career mentors to choose the right track for your goals.
                  </p>
                  <Link
                    href="/contact"
                    className="inline-block w-full py-2.5 px-4 rounded-xl border border-primary text-primary hover:bg-primary hover:text-white text-xs font-bold transition-all"
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