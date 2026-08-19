'use client'

import React, { useState, useEffect } from 'react'
import {
  saveBlogAction,
  trashBlogAction,
  restoreBlogAction,
  deleteBlogAction,
} from '@/app/actions/cmsActions'
import { deleteUnusedImageAction } from '@/app/actions/mediaActions'
import { Icon } from '@iconify/react'

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingBlog, setEditingBlog] = useState<any | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [uploading, setUploading] = useState(false)
  const [featuredImageUrl, setFeaturedImageUrl] = useState('')
  const [contentImagesList, setContentImagesList] = useState<string[]>([])
  const [showTrash, setShowTrash] = useState(false)
  const [search, setSearch] = useState('')

  const fetchBlogs = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/blogs')
      const data = await res.json()
      const fetchedBlogs = data.blogs || []
      setBlogs(fetchedBlogs)

      // Collect all custom category names present in DB
      const dbCategories = fetchedBlogs.map((b: any) => b.category).filter(Boolean)
      if (dbCategories.length > 0) {
        setCategoriesList((prev) => Array.from(new Set([...prev, ...dbCategories])))
      }
    } catch (err) {
      console.error('Failed to fetch blogs:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBlogs()
  }, [])

  const [categoriesList, setCategoriesList] = useState<string[]>([
    'Digital Marketing',
    'Graphic Design',
    'Video Editing',
    'Artificial Intelligence',
    'Career Development',
    'Industry Insights',
  ])
  const [selectedCategoryInput, setSelectedCategoryInput] = useState('Digital Marketing')
  const [isCustomCat, setIsCustomCat] = useState(false)
  const [customCatText, setCustomCatText] = useState('')

  const openForm = (blog?: any) => {
    setIsCustomCat(false)
    setCustomCatText('')
    if (blog) {
      setEditingBlog(blog)
      setFeaturedImageUrl(blog.featuredImage || '')
      setContentImagesList(Array.isArray(blog.images) ? blog.images : [])
      setSelectedCategoryInput(blog.category || 'Digital Marketing')
    } else {
      setEditingBlog(null)
      setFeaturedImageUrl('')
      setContentImagesList([])
      setSelectedCategoryInput(categoriesList[0] || 'Digital Marketing')
    }
    setIsFormOpen(true)
  }

  const [selectedCategory, setSelectedCategory] = useState('ALL')

  const filteredBlogs = blogs.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.slug.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = selectedCategory === 'ALL' || b.category === selectedCategory
    const matchesTrash = showTrash ? b.isDeleted : !b.isDeleted
    return matchesSearch && matchesCategory && matchesTrash
  })

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetField: 'featured' | 'content') => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (data.success && data.url) {
        if (targetField === 'featured') {
          setFeaturedImageUrl(data.url)
        } else if (targetField === 'content') {
          setContentImagesList((prev) => [...prev, data.url])
        }
      } else {
        alert(data.error || 'Upload failed')
      }
    } catch (err) {
      alert('File upload error')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveFeaturedImage = async () => {
    if (!featuredImageUrl) return
    const urlToRemove = featuredImageUrl
    setFeaturedImageUrl('')
    await deleteUnusedImageAction(urlToRemove)
  }

  const handleRemoveContentImage = async (urlToRemove: string) => {
    setContentImagesList((prev) => prev.filter((img) => img !== urlToRemove))
    await deleteUnusedImageAction(urlToRemove)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const finalCategory = isCustomCat
      ? customCatText.trim() || 'General'
      : (formData.get('category') as string) || selectedCategoryInput || 'General'

    if (isCustomCat && customCatText.trim() && !categoriesList.includes(customCatText.trim())) {
      setCategoriesList((prev) => [...prev, customCatText.trim()])
    }

    const payload = {
      title: formData.get('title') as string,
      slug: (formData.get('slug') as string) || (formData.get('title') as string).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category: finalCategory,
      featuredImage: featuredImageUrl.trim() || null,
      images: contentImagesList,
      author: (formData.get('author') as string) || 'QIMD Editorial Team',
      readingTime: Number(formData.get('readingTime')) || 5,
      content: formData.get('content') as string,
      metaTitle: formData.get('metaTitle') as string,
      metaDescription: formData.get('metaDescription') as string,
      canonicalUrl: formData.get('canonicalUrl') as string,
      featured: formData.get('featured') === 'true',
      status: (formData.get('status') as string) || 'PUBLISHED',
      isActive: formData.get('isActive') === 'true',
    }

    const res = await saveBlogAction(payload, editingBlog?.id)
    if (res.success) {
      setStatusMsg({ type: 'success', text: res.message || 'Blog post saved successfully' })
      setIsFormOpen(false)
      setEditingBlog(null)
      fetchBlogs()
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to save blog' })
    }
  }

  const handleTrash = async (id: string) => {
    if (!confirm('Move blog post to Trash?')) return
    const res = await trashBlogAction(id)
    if (res.success) {
      setStatusMsg({ type: 'success', text: 'Blog moved to Trash' })
      fetchBlogs()
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to trash blog' })
    }
  }

  const handleRestore = async (id: string) => {
    const res = await restoreBlogAction(id)
    if (res.success) {
      setStatusMsg({ type: 'success', text: 'Blog restored from Trash' })
      fetchBlogs()
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to restore blog' })
    }
  }

  const handleDeletePermanently = async (id: string) => {
    if (!confirm('WARNING: Permanently delete this blog post? This cannot be undone.')) return
    const res = await deleteBlogAction(id)
    if (res.success) {
      setStatusMsg({ type: 'success', text: 'Blog permanently deleted' })
      fetchBlogs()
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to delete blog' })
    }
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Icon icon="ion:document-text-outline" className="w-6 h-6 text-teal-600" />
            Blogs & Content CMS
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Publish educational articles, SEO blogs, rich content & cover media
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowTrash(!showTrash)}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors flex items-center gap-2 ${
              showTrash
                ? 'bg-amber-50 border-amber-300 text-amber-800'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Icon icon="ion:trash-outline" className="w-4.5 h-4.5" />
            {showTrash ? 'View Active Blogs' : 'View Trash'}
          </button>

          <button
            onClick={() => openForm()}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-colors shadow-xs flex items-center gap-2"
          >
            <Icon icon="ion:add-circle-outline" className="w-4.5 h-4.5" />
            Create Blog Post
          </button>
        </div>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-xl text-sm font-medium border ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {statusMsg.text}
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Search blog title or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
          />
          <Icon icon="ion:search-outline" className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-bold text-slate-600 whitespace-nowrap">Filter Category:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-blue-600 w-full sm:w-auto"
          >
            <option value="ALL">All Categories</option>
            <option value="Digital Marketing">Digital Marketing</option>
            <option value="Graphic Design">Graphic Design</option>
            <option value="Video Editing">Video Editing</option>
            <option value="Artificial Intelligence">Artificial Intelligence</option>
            <option value="Career Development">Career Development</option>
            <option value="Industry Insights">Industry Insights</option>
          </select>
        </div>
      </div>

      {/* Blogs List Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm font-medium">Loading blog articles...</div>
        ) : filteredBlogs.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm font-medium">
            No blog posts found matching criteria. Click &quot;Create Blog Post&quot; above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[750px]">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-bold text-xs border-b border-slate-200">
                <tr>
                  <th className="p-4">Title & Slug</th>
                  <th className="p-4">Category Tab</th>
                  <th className="p-4">Author</th>
                  <th className="p-4">Reading Time</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredBlogs.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <p className="font-semibold text-slate-900 text-base leading-snug">{b.title}</p>
                      <p className="text-slate-400 text-xs font-medium">Slug: /{b.slug}</p>
                    </td>
                    <td className="p-4">
                      <span className="inline-block bg-teal-50 text-teal-800 border border-teal-200 text-xs font-bold px-3 py-1 rounded-full">
                        {b.category || 'Digital Marketing'}
                      </span>
                    </td>
                    <td className="p-4 text-slate-800 font-semibold text-sm">{b.author || 'QIMD Team'}</td>
                    <td className="p-4 text-slate-600 font-medium text-sm">{b.readingTime} min read</td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold inline-block ${
                          b.status === 'PUBLISHED' && b.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {b.status} {b.isActive ? '' : '(Inactive)'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {!b.isDeleted ? (
                        <>
                          <button
                            onClick={() => openForm(b)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Blog"
                          >
                            <Icon icon="ion:create-outline" className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleTrash(b.id)}
                            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Move to Trash"
                          >
                            <Icon icon="ion:trash-outline" className="w-5 h-5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleRestore(b.id)}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Restore"
                          >
                            <Icon icon="ion:refresh-outline" className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeletePermanently(b.id)}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Permanently"
                          >
                            <Icon icon="ion:trash-bin-outline" className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Blog Modal Form */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200/80 rounded-3xl w-full max-w-2xl p-6 sm:p-7 max-h-[88vh] overflow-y-auto no-scrollbar space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h2 className="text-lg font-bold text-slate-900">
                {editingBlog ? 'Edit Blog Article' : 'Create New Blog Article'}
              </h2>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-700 p-1">
                <Icon icon="ion:close" className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Blog Title *</label>
                  <input
                    type="text"
                    name="title"
                    required
                    defaultValue={editingBlog?.title || ''}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">SEO Slug</label>
                  <input
                    type="text"
                    name="slug"
                    defaultValue={editingBlog?.slug || ''}
                    placeholder="e.g. top-ai-tools-2026"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  />
                </div>
              </div>

              {/* Upload Featured/Cover Image from Computer + Live Preview with X/Remove */}
              <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl space-y-3">
                <label className="block text-slate-700 font-semibold">Featured Cover Image (Upload from Computer or URL)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    name="featuredImage"
                    value={featuredImageUrl}
                    onChange={(e) => setFeaturedImageUrl(e.target.value)}
                    placeholder="Upload image from computer or enter URL..."
                    className="flex-1 bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono"
                  />
                  <label className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl cursor-pointer font-semibold transition-colors flex items-center gap-1.5 shrink-0">
                    <Icon icon="ion:cloud-upload-outline" className="w-4 h-4" />
                    {uploading ? 'Uploading...' : 'Upload Cover'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'featured')}
                    />
                  </label>
                </div>

                {featuredImageUrl && (
                  <div className="relative w-56 h-32 rounded-xl overflow-hidden border border-slate-300 bg-white p-1 group">
                    <img src={featuredImageUrl} alt="Featured Cover Preview" className="w-full h-full object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={handleRemoveFeaturedImage}
                      className="absolute top-2 right-2 bg-rose-600 hover:bg-rose-700 text-white p-1.5 rounded-full shadow-md transition-colors"
                      title="Remove Cover Image"
                    >
                      <Icon icon="ion:close" className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Blog Category Tab *</label>
                  {!isCustomCat ? (
                    <div className="space-y-1.5">
                      <select
                        name="category"
                        value={selectedCategoryInput}
                        onChange={(e) => {
                          if (e.target.value === 'CUSTOM') {
                            setIsCustomCat(true)
                          } else {
                            setSelectedCategoryInput(e.target.value)
                          }
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-semibold"
                      >
                        {categoriesList.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                        <option value="CUSTOM">+ Add New Custom Category Tab</option>
                      </select>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          name="category"
                          required
                          placeholder="Type new category tab name..."
                          value={customCatText}
                          onChange={(e) => setCustomCatText(e.target.value)}
                          className="w-full bg-white border border-blue-400 rounded-xl p-2.5 text-slate-900 font-semibold"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setIsCustomCat(false)
                            setSelectedCategoryInput(categoriesList[0] || 'Digital Marketing')
                          }}
                          className="px-3 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs shrink-0"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Author Name</label>
                  <input
                    type="text"
                    name="author"
                    defaultValue={editingBlog?.author || 'QIMD Editorial Team'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Est. Reading Time (Mins)</label>
                  <input
                    type="number"
                    name="readingTime"
                    defaultValue={editingBlog?.readingTime || 5}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  />
                </div>
              </div>

              {/* Upload Content/Multiple Images Tool */}
              <div className="bg-blue-50/50 p-4 border border-blue-100 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-blue-900 flex items-center gap-1.5 text-xs">
                      <Icon icon="ion:images-outline" className="w-4 h-4 text-blue-600" />
                      Multiple Content Images Management
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Upload multiple images to be stored, saved, and rendered inside this blog article
                    </p>
                  </div>

                  <label className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl cursor-pointer font-semibold transition-colors flex items-center gap-1.5 shrink-0">
                    <Icon icon="ion:cloud-upload" className="w-4 h-4" />
                    + Upload Content Image
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'content')}
                    />
                  </label>
                </div>

                {contentImagesList.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {contentImagesList.map((imgUrl, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs relative group">
                        <img src={imgUrl} alt={`Content Image ${idx + 1}`} className="w-14 h-14 object-cover rounded-lg border border-slate-100 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-800 font-bold truncate text-[11px]">Image {idx + 1}</p>
                          <p className="text-slate-400 truncate text-[10px] font-mono">{imgUrl}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <button
                              type="button"
                              onClick={() => navigator.clipboard.writeText(`![Image](${imgUrl})`)}
                              className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-semibold flex items-center gap-1"
                            >
                              <Icon icon="ion:copy-outline" className="w-3 h-3" /> Copy Markdown
                            </button>
                            <button
                              type="button"
                              onClick={() => navigator.clipboard.writeText(`<img src="${imgUrl}" alt="Blog Image" />`)}
                              className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-semibold flex items-center gap-1"
                            >
                              <Icon icon="ion:code-slash-outline" className="w-3 h-3" /> HTML
                            </button>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveContentImage(imgUrl)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Content Image"
                        >
                          <Icon icon="ion:trash-outline" className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Article Content (Supports Markdown & HTML Images) *
                </label>
                <textarea
                  name="content"
                  required
                  rows={10}
                  defaultValue={editingBlog?.content || ''}
                  placeholder="Write article text. Insert content images as ![Caption](/uploads/image.jpg)..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-mono"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">SEO Meta Title</label>
                  <input
                    type="text"
                    name="metaTitle"
                    defaultValue={editingBlog?.metaTitle || ''}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">SEO Meta Description</label>
                  <input
                    type="text"
                    name="metaDescription"
                    defaultValue={editingBlog?.metaDescription || ''}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Publish Status</label>
                  <select
                    name="status"
                    defaultValue={editingBlog?.status || 'PUBLISHED'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  >
                    <option value="PUBLISHED">Published</option>
                    <option value="DRAFT">Draft</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Featured Article</label>
                  <select
                    name="featured"
                    defaultValue={editingBlog ? String(editingBlog.featured) : 'false'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  >
                    <option value="true">Featured</option>
                    <option value="false">Standard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Active Status</label>
                  <select
                    name="isActive"
                    defaultValue={editingBlog ? String(editingBlog.isActive) : 'true'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-xs"
                >
                  Save Blog Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
