import React from "react";
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

// Rendered on request: no database access during `next build`
// (prevents Prisma engine panics / thread exhaustion on the build server).
export const dynamic = "force-dynamic";
export const dynamicParams = true;
export const revalidate = 0;

export async function generateStaticParams() {
  return [];
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
    alternates: { canonical: `https://www.quickuppinstitute.com/blog/${slug}` },
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
        if (/^https:\/\/(www\.)?quickuppinstitute\.com/.test(linkHref)) {
          linkHref = linkHref.replace(/^https:\/\/(www\.)?quickuppinstitute\.com/, "") || "/";
        }
        return (
          <Link
            key={i}
            href={linkHref}
            className="qd-link"
          >
            {linkText}
          </Link>
        );
      }
    }
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="qd-strong">
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

    // Skip any standalone image markdown
    if (/^!\[.*?\]\(.*?\)$/.test(line)) {
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
        images: Array.isArray(dbPost.images) ? (dbPost.images as string[]) : [],
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

  const heroImage = post.coverImage || "/images/programs/digital-marketing-poster.jpg";
  const rawImages = (post.images || []).filter((img: string) => img && img !== heroImage);
  const subImages = rawImages.length > 0 ? rawImages : [];
  const { toc, blocks } = parseBlogContent(post.content || "");

  // Find all H2 indices to position the side-by-side subimages in between sections
  const h2Indices: number[] = [];
  blocks.forEach((b, idx) => {
    if (b.type === "h2") {
      h2Indices.push(idx);
    }
  });
  const midH2BlockIdx =
    h2Indices.length > 2
      ? h2Indices[Math.floor(h2Indices.length / 2)]
      : blocks.length > 2
      ? Math.floor(blocks.length / 2)
      : -1;

  const tocList = (
    <ol className="qd-toc-list">
      {toc.map((item, i) => (
        <li key={item.id}>
          <a href={`#${item.id}`}>
            <span className="qd-toc-num">{String(i + 1).padStart(2, "0")}</span>
            <span>{item.title}</span>
          </a>
        </li>
      ))}
    </ol>
  );

  return (
    <div className="qb qd">
      <span className="qd-progress" aria-hidden="true" />

      {/* Article header */}
      <div className="qd-head">
        <div className="qb-wrap">
          <nav className="qd-crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <Icon icon="ion:chevron-forward" />
            <Link href="/blog">Blogs</Link>
            <Icon icon="ion:chevron-forward" />
            <span>{post.title}</span>
          </nav>

          <div className="qd-head-inner">
            <span className="qb-kicker">{post.category}</span>
            <h1 className="qd-title">{post.title}</h1>
            <div className="qd-meta">
              {post.publishedAt && (
                <span>
                  <Icon icon="mdi:calendar-outline" /> {post.publishedAt}
                </span>
              )}
              {post.readTime && (
                <span>
                  <Icon icon="mdi:clock-outline" /> {post.readTime}
                </span>
              )}
              {(post as any).isEdited && (post as any).updatedAt && (
                <span className="qd-updated">
                  <Icon icon="mdi:pencil-outline" /> Updated: {(post as any).updatedAt}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Featured cover image */}
      {heroImage && (
        <div className="qb-wrap">
          <figure className="qd-cover">
            <Image
              src={heroImage}
              alt={post.title}
              width={1920}
              height={1080}
              priority
              sizes="(max-width: 1200px) 100vw, 1136px"
            />
          </figure>
        </div>
      )}

      <div className="qb-wrap">
        <div className={`qd-layout${toc.length > 0 ? "" : " no-toc"}`}>
          {/* Table of contents (desktop rail) */}
          {toc.length > 0 && (
            <nav className="qd-toc" aria-label="Table of Contents">
              <h2 className="qd-toc-title">Table of Contents</h2>
              {tocList}
            </nav>
          )}

          {/* Article */}
          <article className="qd-article">
            {toc.length > 0 && (
              <details className="qd-toc-m">
                <summary>
                  <span>Table of Contents</span>
                  <Icon icon="mdi:chevron-down" />
                </summary>
                {tocList}
              </details>
            )}

            <div className="qd-body">
              {blocks.map((block, idx) => (
                <React.Fragment key={idx}>
                  {/* In-between sub-images */}
                  {idx === midH2BlockIdx && subImages.length > 0 && (
                    <div className={`qd-gallery ${subImages.length === 2 ? 'is-two' : ''}`}>
                      {subImages.map((imgSrc: string, i: number) => (
                        <div key={i} className="qd-gallery-item">
                          <Image
                            src={imgSrc}
                            alt={`${post.title} Preview ${i + 1}`}
                            width={1920}
                            height={1080}
                            sizes="(max-width: 768px) 50vw, 33vw"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {block.type === "h2" && (
                    <h2 id={block.id} className="qd-h2">
                      {formatInlineText(block.title || "")}
                    </h2>
                  )}

                  {block.type === "h3" && (
                    <h3 id={block.id} className="qd-h3">
                      {formatInlineText(block.title || "")}
                    </h3>
                  )}

                  {block.type === "list" && block.items && (
                    <ul className="qd-list">
                      {block.items.map((item, itemIdx) => {
                        const boldMatch = item.match(/^\*\*(.*?)\*\*:\s*(.*)$/);
                        return (
                          <li key={itemIdx}>
                            {boldMatch ? (
                              <>
                                <strong className="qd-strong">{boldMatch[1]}: </strong>
                                <span>{formatInlineText(boldMatch[2])}</span>
                              </>
                            ) : (
                              formatInlineText(item)
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  {block.type === "date" && <p className="qd-date">{block.content}</p>}

                  {block.type === "paragraph" && block.content && (
                    <p>{formatInlineText(block.content)}</p>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Topics & Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="qd-tags">
                <span className="qd-tags-label">Topics:</span>
                {post.tags.map((tag, i) => (
                  <span key={i} className="qd-tag">#{tag}</span>
                ))}
              </div>
            )}
          </article>

          {/* Sidebar */}
          <aside className="qd-side">
            <div className="qd-side-inner">
              {/* Course Enquiry CTA Box */}
              <div className="qd-promo">
                <span className="qd-promo-kicker">Practical Training</span>
                <h3>Interested in {post.category}?</h3>
                <p>
                  Join QIMD&apos;s offline classroom training in Hinjewadi, Pune. Work on live client projects with mentor access.
                </p>
                <Link href="/courses" className="qd-btn qd-btn-light">
                  <span>Explore Our Programs</span>
                  <Icon icon="mdi:arrow-right" />
                </Link>
              </div>

              {/* Related Articles Box */}
              {relatedPosts.length > 0 && (
                <div className="qd-related">
                  <h4 className="qd-side-title">
                    <Icon icon="ion:newspaper-outline" />
                    <span>Other Guides &amp; Articles</span>
                  </h4>
                  <div className="qd-related-list">
                    {relatedPosts.map((related) => {
                      const relatedImg = (related as any).featuredImage || (related as any).coverImage || "/images/programs/digital-marketing-poster.jpg";
                      return (
                        <Link key={related.id || related.slug} href={`/blog/${related.slug}`} className="qd-related-item">
                          <span className="qd-related-img">
                            <Image src={relatedImg} alt={related.title} fill sizes="72px" />
                          </span>
                          <span className="qd-related-text">
                            <span className="qd-related-title">{related.title}</span>
                            <span className="qd-related-cat">{related.category}</span>
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Free Counselling CTA */}
              <div className="qd-help">
                <span className="qd-help-ic">
                  <Icon icon="ion:headset-outline" />
                </span>
                <h4>Need Career Advice?</h4>
                <p>Talk to our senior career mentors to choose the right track for your goals.</p>
                <Link href="/contact" className="qd-btn qd-btn-ink">
                  Book Free Counselling
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
