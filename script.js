async function fetchQuote () {
  const res = await fetch('https://domtorrettoquotesapi-73dfacef14e4.herokuapp.com/')
  const data = await res.json()
  if (data) {
    return data
  }
  throw new Error('Unable to fetch quote')
}

function AuthModule () {
 
    const authOrigins = ['https://domtorrettoquotesapi-73dfacef14e4.herokuapp.com']
    let token

    this.setToken = (value) => {
      token = value
    }
    this.fetch = (resource, options) => {
      const req = new Request(resource, options)
      const destOrigin = new URL(req.url).origin
      if (token && authOrigins.includes(destOrigin)) {
        req.headers.set('Authorization', 'Bearer ' + token)
      }
      return fetch(req)
    }
}

const auth = new AuthModule()

async function postLogin (data) {
  try {
    const res = await fetch('https://domtorrettoquotesapi-73dfacef14e4.herokuapp.com/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    const returnedData = await res.json()
    auth.setToken(returnedData.token)
    console.log('Sucess')
  } catch (err) {
    console.error('Error:', err)
  }
}

fetchQuote().then(x => loadQuote(x)).catch(err => console.log(err))

function loadQuote (quoteData) {
  document.querySelector('section').innerHTML = `<div><div><blockquote>"${quoteData.quote}"</blockquote><p>- ${quoteData.movie_title}</p></div></div>`
}

const buttons = document.querySelectorAll('body button')
const getQuoteBtn = Array.from(buttons)[0]
const loginBtn = Array.from(buttons)[4]

loginBtn.addEventListener('click', () => {
  formLogin.classList.toggle('show')
  loginBtn.classList.toggle('show')
})
getQuoteBtn.addEventListener('click', () => fetchQuote().then(x => loadQuote(x)).catch(err => console.log(err)))

const formQuote = document.querySelector('section form')
const formLogin = document.querySelector('section:last-of-type form')

formLogin.addEventListener('submit', (event) => {
  event.preventDefault()
  const [email, password] = getLoginSubmitData()
  const formData = {
    email,
    password
  }
  sessionStorage.removeItem(email)
  sessionStorage.removeItem(password)
  postLogin(formData)
    .then(res => {
      formLogin.classList.toggle('show')
      Array.from(buttons)[1].classList.toggle('show')
      Array.from(buttons)[2].classList.toggle('show')
      Array.from(buttons)[3].classList.toggle('show')
    })
    .catch(err => console.log(err))
})

function getPostQuoteData () {
  const quoteInput = document.querySelector('section form textarea')
  const movieTitleInput = Array.from(document.querySelectorAll('section form input'))[0]
  return [quoteInput.value, movieTitleInput.value]
}

const postQuoteBtn = Array.from(buttons)[1]

function getLoginSubmitData () {
  const emailInput = Array.from(document.querySelectorAll('section:last-of-type form input'))[0]
  const passwordInput = Array.from(document.querySelectorAll('section:last-of-type form input'))[1]
  return [emailInput.value, passwordInput.value]
}

postQuoteBtn.addEventListener('click', () => {
  formQuote.classList.toggle('show')
})

const submitQuoteBtn = Array.from(document.querySelectorAll('section form input'))[1]
const loadingGif = document.querySelector('.loading')
const successMessage = document.querySelector('body section:nth-of-type(2) p')
const objKeyErrors = ['integrity_error', 'not_found', 'invalid_auth', 'validation_error', 'bad_request']

function postRequest (data) {
auth.fetch('https://domtorrettoquotesapi-73dfacef14e4.herokuapp.com/new/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
    .then(response => {
      if (response.status === 201) {
        loadingGif.classList.toggle('show')
        successMessage.classList.toggle('show')
        setTimeout(() => {successMessage.classList.toggle('show')}, 3000)
        submitQuoteBtn.disabled = false
        return response.json()
      } else {
        throw response.json()
      }
    })
    .then(data => console.log(data))
    .catch(err => {
      console.log(err)
      err.then(obj => {
        loadingGif.classList.toggle('show')
        Object.keys(obj).map(key => {
          if (objKeyErrors.includes(key) && key === 'integrity_error') {
            successMessage.innerText = `Quote already exists in collection, fam.`
            successMessage.style.backgroundColor = '#fc030d90'
            successMessage.style.borderColor = '#fc030d'
          }
          successMessage.classList.toggle('show')
          setTimeout(() => {
            successMessage.classList.toggle('show')
            successMessage.style.backgroundColor = '#2dd23c90'
          }, 4000)
          submitQuoteBtn.disabled = false
        })
      })
    })
}

formQuote.addEventListener('submit', (event) => {
  loadingGif.classList.toggle('show')
  event.preventDefault()
  submitQuoteBtn.disabled = true
  const [quote, movieTitle] = getPostQuoteData()
  const formData = {
    quote,
    movie_title: movieTitle
  }
  // successMessage.classList.toggle('show')
  postRequest(formData)
})

console.log('End of main')
