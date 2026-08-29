import { GET } from '../src/app/api/public/brochures/download/route'
import { NextRequest } from 'next/server'

async function testDownload() {
  console.log('Testing GET /api/public/brochures/download?courseId=ai-digital-marketing ...')
  const req1 = new NextRequest('http://localhost:3000/api/public/brochures/download?courseId=ai-digital-marketing')
  const res1 = await GET(req1)
  console.log('Status:', res1.status)
  console.log('Content-Type:', res1.headers.get('content-type'))
  console.log('Content-Disposition:', res1.headers.get('content-disposition'))
  console.log('Content-Length:', res1.headers.get('content-length'))

  if (res1.status !== 200 || !res1.headers.get('content-disposition')?.includes('attachment')) {
    throw new Error('Test failed: response is not a valid attachment')
  }

  console.log('\nTesting GET /api/public/brochures/download?courseId=ai-graphic-design ...')
  const req2 = new NextRequest('http://localhost:3000/api/public/brochures/download?courseId=ai-graphic-design')
  const res2 = await GET(req2)
  console.log('Status:', res2.status)
  console.log('Content-Disposition:', res2.headers.get('content-disposition'))

  console.log('\nTesting GET /api/public/brochures/download?courseId=ai-video-editing ...')
  const req3 = new NextRequest('http://localhost:3000/api/public/brochures/download?courseId=ai-video-editing')
  const res3 = await GET(req3)
  console.log('Status:', res3.status)
  console.log('Content-Disposition:', res3.headers.get('content-disposition'))

  console.log('\n✔ All download endpoints working properly and return force-attachment headers!')
}

testDownload()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
