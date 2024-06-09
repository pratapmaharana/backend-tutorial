import dotenv from 'dotenv'
import express from 'express'

const env = dotenv.config()
const app = express()
const port = process.env.PORT || 3000

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get('/author', (req, res) => {
    res.send('Pratap Chandra Maharana')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
