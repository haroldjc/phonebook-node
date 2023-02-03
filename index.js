require('dotenv').config()
const { application } = require('express')
const express = require('express')
const nodemon = require('nodemon')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')
const app = express()

app.use(cors())
app.use(express.json())
app.use(express.static('build'))

// Morgan middleware
morgan.token('body', (req, res) => JSON.stringify(req.body));

app.use(morgan((tokens, req, res) => {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    tokens.body(req, res)
  ].join(' ')
}))

const generateID = () => {
  return Math.floor(Math.random() * 1000)
}

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id)
    .then(person => {
      response.json(person)
    })
})

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'Name or number missing'
    })
  }

  // Check if name is already in DB
  Person.findOne({
    name: body.name
  }).then(returnedPerson => {
    if (returnedPerson) {
      return response.status(400).json({
        error: `${returnedPerson.name} is already in the phonebook`
      })
    }

    const person = new Person({
      name: body.name,
      number: body.number
    })
  
    person.save()
      .then(savedPerson => {
        response.json(savedPerson)
      })
  })
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(person => person.id === id)

  if (person) {
    persons = persons.filter(person => person.id !== id)
    response.status(204).end()
  } else {
    response.status(400).end()
  }
})

app.get('/info', (request, response) => {
  response.send(`<p>Phonebook has info for ${persons.length} people</p><p>${new Date()}</p>`)
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

app.use(morgan)

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running at port ${PORT}`)
})

