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
      where: { status: 'PUBLISHED', isDeleted: false },
      select: { slug: true },
    })
    if (dbBlogs.length > 0) {
      return dbBlogs.map((b) => ({ slug: b.slug }))
    }
  } catch (err) {
    console.error('Error fetching static blog params:', err)
  }
  return blogsData.map((post) => ({ slug: post.slug }))
}


export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const dbPost = await db.blog.findUnique({ where: { slug } });
  const post = dbPost ? {
    title: dbPost.title,
    excerpt: dbPost.metaDescription || dbPost.content.substring(0, 150),
    slug: dbPost.slug,
  } : blogsData.find((p) => p.slug === slug);

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

export default async function BlogDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const dbPost = await db.blog.findUnique({ where: { slug } });
  
  const post = dbPost ? {
    id: dbPost.id,
    title: dbPost.title,
    slug: dbPost.slug,
    category: dbPost.category || 'Blog Article',
    author: dbPost.author || 'QIMD Editorial Team',
    readTime: `${dbPost.readingTime} min read`,
    publishedAt: dbPost.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    coverImage: dbPost.featuredImage || '/images/blog/blog-1.jpg',
    excerpt: dbPost.metaDescription || (dbPost.content ? dbPost.content.substring(0, 160) + '...' : ''),
    content: dbPost.content,
    images: Array.isArray(dbPost.images) ? (dbPost.images as string[]) : [],
    tags: Array.isArray(dbPost.tags) ? (dbPost.tags as string[]) : ['AI Tools', 'Practical Training', 'QIMD'],
  } : blogsData.find((p) => p.slug === slug);

  if (!post) notFound();

  const relatedPosts = blogsData.filter((p) => p.slug !== post.slug).slice(0, 3);
  const heroImage = post.coverImage || (post.images && post.images.length > 0 ? post.images[0] : "");
  const contentImages = post.images ? post.images.filter((img) => img !== heroImage) : [];

  return (
    <>
      <section className="section-py bg-grey dark:bg-dark">
        <div className="container mx-auto lg:max-w-(--breakpoint-xl) md:max-w-(--breakpoint-md) px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Article */}
            <article className="lg:col-span-8 bg-white dark:bg-darklight rounded-3xl p-6 sm:p-8 shadow-sm border border-border dark:border-dark_border">
              {/* Primary Featured Hero Cover Image */}
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

              {/* Meta Row */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="bg-primary/10 text-primary dark:text-amber-400 font-bold text-xs px-3 py-1 rounded-full">
                  {post.category}
                </span>
                {post.readTime && (
                  <span className="text-xs text-muted dark:text-white/60 flex items-center gap-1">
                    <Icon icon="mdi:clock-outline" /> {post.readTime}
                  </span>
                )}
                {post.publishedAt && (
                  <span className="text-xs text-muted dark:text-white/60 flex items-center gap-1">
                    <Icon icon="mdi:calendar-outline" /> {post.publishedAt}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-midnight_text dark:text-white mb-6 leading-tight">
                {post.title}
              </h1>

              {/* Author */}
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-border dark:border-dark_border">
                <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon icon="mdi:account" className="text-primary text-2xl" />
                </div>
                <div>
                  <p className="font-bold text-sm text-midnight_text dark:text-white">{post.author}</p>
                  <p className="text-xs text-muted dark:text-white/60">QIMD Faculty &amp; Industry Mentor</p>
                </div>
              </div>

              {/* Article Body Content */}
              <div className="blog-details space-y-6 text-muted dark:text-white/80 text-base leading-relaxed">
                {post.excerpt && (
                  <p className="text-lg font-medium text-midnight_text dark:text-white/90 leading-relaxed">
                    {post.excerpt}
                  </p>
                )}

                {post.content ? (
                  post.content.split('\n\n').map((paragraph, idx) => {
                    const imgMatch = paragraph.match(/!\[(.*?)\]\((.*?)\)/) || paragraph.match(/<img.*?src=["'](.*?)["'].*?\/>/);
                    if (imgMatch) {
                      const src = imgMatch[2] || imgMatch[1];
                      const alt = imgMatch[1] || post.title;
                      return (
                        <div key={idx} className="my-6 relative w-full aspect-[16/9] rounded-2xl overflow-hidden shadow-md border border-border/60">
                          <Image src={src} alt={alt} fill sizes="(max-width: 768px) 100vw, 800px" className="object-cover" />
                        </div>
                      );
                    }
                    return <p key={idx}>{paragraph}</p>;
                  })
                ) : (
                  <p>
                    At QIMD Institute, we provide practical, project-driven learning that equips students with real-world industry applications in {post.category}. Our hands-on training integrates modern AI tools directly into daily workflows.
                  </p>
                )}

                {/* Simple Unboxed Key Takeaways List */}
                {post.tags && post.tags.length > 0 && (
                  <div className="pt-2 pb-2 space-y-3">
                    <h3 className="text-lg font-extrabold text-midnight_text dark:text-white flex items-center gap-2">
                      <Icon icon="mdi:lightbulb-on" className="text-secondary text-xl" />
                      <span>Key Takeaways</span>
                    </h3>
                    <ul className="space-y-2.5 pl-1">
                      {post.tags.map((tag, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm font-semibold text-midnight_text dark:text-white/90">
                          <Icon icon="mdi:check-circle" className="text-emerald-500 flex-shrink-0 text-lg" />
                          <span>Mastering {tag} strategies for modern industry campaigns</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Simple Unboxed Sub-Images Grid */}
                {contentImages.length > 0 && (
                  <div className="pt-4 pb-2 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-midnight_text dark:text-white uppercase tracking-wider">
                      <Icon icon="mdi:image-multiple-outline" className="text-primary dark:text-secondary text-base" />
                      <span>Visual References &amp; Workflows</span>
                    </div>

                    <div className={`grid gap-5 ${contentImages.length === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
                      {contentImages.map((imgUrl, i) => (
                        <figure key={i} className="space-y-2">
                          <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden shadow-sm border border-border/70 dark:border-dark_border/70">
                            <Image
                              src={imgUrl}
                              alt={`${post.title} visual reference ${i + 1}`}
                              fill
                              sizes="(max-width: 768px) 100vw, 450px"
                              className="object-cover"
                            />
                          </div>
                          <figcaption className="text-xs text-muted dark:text-white/60 font-medium">
                            Visual Guide 0{i + 1} — {post.category}
                          </figcaption>
                        </figure>
                      ))}
                    </div>
                  </div>
                )}

                <p>
                  By mastering these techniques and leveraging modern AI workflows, students build high-value portfolios that stand out to hiring partners.
                </p>
              </div>

              {/* Tags */}
              <div className="mt-10 pt-6 border-t border-border dark:border-dark_border flex flex-wrap gap-2 items-center">
                <span className="text-xs font-bold text-midnight_text dark:text-white mr-2">Topics:</span>
                {post.tags.map((tag, i) => (
                  <span key={i} className="text-xs bg-grey dark:bg-dark text-midnight_text dark:text-white/70 px-3 py-1.5 rounded-full border border-border/50 dark:border-dark_border/50">
                    #{tag}
                  </span>
                ))}
              </div>
            </article>

            {/* Sidebar */}
            <aside className="lg:col-span-4">
              <div className="sticky top-24 space-y-6">
                {/* Enquire CTA */}
                <div className="bg-slate-900 dark:bg-darklight rounded-2xl p-6 text-white border border-slate-800 shadow-lg">
                  <h3 className="font-bold text-lg mb-2">Interested in Learning {post.category}?</h3>
                  <p className="text-white/80 text-xs sm:text-sm mb-5 leading-relaxed">
                    Join QIMD&apos;s practical training program and become an industry-ready professional.
                  </p>
                  <Link
                    href="/courses"
                    className="block text-center bg-secondary hover:bg-amber-400 text-midnight_text font-extrabold py-3 rounded-xl text-sm transition-all shadow"
                  >
                    View Our Courses
                  </Link>
                </div>

                {/* Related Posts */}
                {relatedPosts.length > 0 && (
                  <div className="bg-white dark:bg-darklight rounded-2xl p-5 shadow-sm border border-border dark:border-dark_border">
                    <h4 className="font-bold text-midnight_text dark:text-white mb-4">Related Articles</h4>
                    <div className="space-y-4">
                      {relatedPosts.map((related) => {
                        const relatedImg = related.coverImage || (related.images && related.images[0]) || '';
                        return (
                          <Link
                            key={related.id}
                            href={`/blog/${related.slug}`}
                            className="flex gap-3 group items-center"
                          >
                            <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-900 flex-shrink-0 border border-border/50">
                              {relatedImg ? (
                                <Image
                                  src={relatedImg}
                                  alt={related.title}
                                  fill
                                  sizes="64px"
                                  className="object-cover group-hover:scale-105 transition-transform"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                                  <Icon icon="mdi:newspaper" className="text-xl" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-midnight_text dark:text-white group-hover:text-primary dark:group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
                                {related.title}
                              </p>
                              <p className="text-[11px] text-muted dark:text-white/50 mt-1">{related.category}</p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}