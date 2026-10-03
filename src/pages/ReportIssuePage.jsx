import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { CATEGORIES } from '../data/sampleIssues'
import './ReportIssuePage.css'

function ReportIssuePage({ user, onSubmit }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [location, setLocation] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [photoFile, setPhotoFile] = useState(null)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    return () => {
      if (photoUrl) {
        URL.revokeObjectURL(photoUrl)
      }
    }
  }, [photoUrl])

  function handlePhotoChange(event) {
    const file = event.target.files[0]
    setPhotoFile(file || null)
    if (!file) {
      setPhotoUrl('')
      return
    }
    setPhotoUrl(URL.createObjectURL(file))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!title.trim() || !description.trim() || !location.trim()) {
      setError('Please fill in title, description, and location.')
      return
    }
    if (!user?.id) {
      setError('You must be logged in to submit an issue.')
      return
    }

    setError('')
    setIsSubmitting(true)

    try {
      let uploadedPhotoUrl = null

      if (photoFile) {
        const extension = photoFile.name.match(/\.[a-zA-Z0-9]+$/)?.[0].toLowerCase() || ''
        const filePath = `${user.id}/${crypto.randomUUID()}${extension}`
        const { error: uploadError } = await supabase.storage
          .from('issue-photos')
          .upload(filePath, photoFile, {
            contentType: photoFile.type,
            upsert: false,
          })

        if (uploadError) {
          console.error('Supabase photo upload error:', uploadError)
          setError(`Failed to upload photo: ${uploadError.message}`)
          return
        }

        const { data: publicUrlData } = supabase.storage
          .from('issue-photos')
          .getPublicUrl(filePath)
        uploadedPhotoUrl = publicUrlData.publicUrl
      }

      const { error: insertError } = await supabase
        .from('issues')
        .insert({
          title: title.trim(),
          description: description.trim(),
          category,
          location: location.trim(),
          photo_url: uploadedPhotoUrl,
          priority: 'Medium',
          status: 'Pending',
          reported_by: user.id,
        })

      if (insertError) {
        throw insertError
      }

      onSubmit()
    } catch (submitError) {
      console.error('Supabase insert error:', submitError)
      setError(`Failed to submit issue: ${submitError.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }
  return (
    <main className="page">
      <div className="page-header">
        <div>
          <h1>Report an issue</h1>
          <p>Tell campus staff what needs to be fixed.</p>
        </div>
      </div>

      <form className="card report-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Broken ceiling fan in B-204"
            />
          </div>

          <div className="field">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What is wrong, and when did you notice it?"
            />
          </div>

          <div className="field">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="location">Location</label>
            <input
              id="location"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Block B, Room 204"
            />
          </div>

          <div className="field">
            <label htmlFor="photo">Photo (optional)</label>
            <input id="photo" type="file" accept="image/*" onChange={handlePhotoChange} />
            {photoUrl && <img className="photo-preview" src={photoUrl} alt="Selected issue" />}
          </div>
        </div>

        {error && <p className="form-error">{error}</p>}

        <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit issue'}
        </button>
      </form>
    </main>
  )
}

export default ReportIssuePage
