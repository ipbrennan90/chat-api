import request from 'supertest'
import app from '../server'
describe('Sample Test', () => {
  it('should serve hello world', async () => {
    const res = await request(app).get('/')
    expect(res.statusCode).toEqual(200)
    console.log(res)
    expect(res.text).toEqual('Hello World!')
  })
})
