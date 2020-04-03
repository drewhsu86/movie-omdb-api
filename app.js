// point of this webpage is to
// 1) have someone type a movie into the search field
// 2) use omdb to process the search and return a list
// 3) store the movies to a list then populate 
//    a bunch of divs with the name, movie poster, etc
// 4) looking at the api queries i did,
//     a) s= will search multiple, separate words with _ or +
//     b) hold these as an array: these have less details (only 4)
//     c) if viewer wants more details we can have a child div
//     d) we can set up the divs (probably not that many)
//        with nested api calls and async
//     e) the subdiv will be hidden and a button can be used to
//     f) show "more details" and reveal the div

// global variables

const DOMAIN = 'https://www.omdbapi.com/';
const API_KEY = 'c8da5667'
const BASE_URL = `${DOMAIN}?apikey=${API_KEY}&`;
// for movie queries on omdb separate word with _ or + and use s=

// pertaining to classes
const movieClassName = 'movieDiv'
const dropClassName = 'dropDiv'
const movieListDiv = document.querySelector('.movie-list')
// console.log(movieListDiv)

// input field 
const searchInput = document.querySelector('#blank')
const searchButton = document.querySelector('#search')

searchButton.addEventListener("click", async (e) => {
  e.preventDefault()

  // create url
  // parse the input
  //  it can't be blank
  //  change spaces to _ or +
  //  case doesn't seem to matter 
  //  placeholder 'Movie Title' doesn't affect value I think

  const url = properURL(searchInput.value, 's=')


  // properURL either returns a url, or false
  if (properURL !== false) {
    // do the s= search (url already prepared properly)
    // with axios.get
    // then check length of array
    // if 0, return one div (no movies found)
    // if 1 or more, iterate through array and create divs

    const axQuery = await axios.get(url)


    // axQuery > data > Search (this is an array)

    const moviesArr = axQuery.data['Search']
    // console.log(moviesArr)

    // before doing anything to the array, empty the div 
    movieListDiv.innerHTML = ''

    // if moviesArr is empty we print sorry no movies brah or sish
    // no movies means moviesArr is undefined (i guess no key-value)
    if (moviesArr) {
      // for each movie, we set up our html elements
      // we will have helper functions that do this 
      for (movie of moviesArr) {

        // appendChild makeMovieDiv to movie-list
        movieListDiv.append(makeMovieDiv(movie))

        // console.log(movieListDiv)

      } // end of for loop over moviesArr
    } else {
      addToParent(movieListDiv, 'h1', 'Sorry, this search had no results. <br> Try another movie name.', [])
    }



  } else {
    // no info in the search bar 
    searchInput.setAttribute('placeHolder', 'No Movie Detected')
  }

}) // end of addEventListener for searchButton




// functions 

// function properURL puts together the query for the omdb API
function properURL(titleStr, q) {
  // console.log(titleStr)
  // the title will have spaces we replace them with + 
  const titleArr = titleStr.split(' ')
  // console.log(titleArr)
  // if there are symbols other than spaces
  if (titleArr.length > 1 || titleArr[0] !== "") {
    const titleStrPlus = titleArr.join('+')
    // console.log(titleStrPlus)

    // proper url is: BASE_URL + 's=' + titleStrPlus
    // q will be 's=' for the main search button 
    result = BASE_URL + q + titleStrPlus
    // console.log(result)
    return result
  } else {

    return false
  }
} // end of function properURL


// function makes a movie by taking in a "movie"
// which is an object with
// Title, Year, imdbID, Type, and Poster (300 x 466)
function makeMovieDiv(movie) {

  // create element div for movie
  // add its class
  const movieDiv = document.createElement('div')
  movieDiv.className = movieClassName

  const movieData = [
    movie.Title,
    movie.Year,
    movie.imdbID,
    movie.Type,
    movie.Poster
  ]
  // console.log(movieData)
  // addToParent(parent, type, inText, attrArr)

  // title 
  addToParent(movieDiv, 'h2', movieData[0], [])


  // make a div that holds things left-right
  // posterHolder class
  // its a flex with direction row 
  const posterHolder = addToParent(movieDiv, 'div', '', [['class', 'posterHolder']])

  // poster is an img so the call is slightly different
  // decided to make img as anchors 
  addToParent(posterHolder, 'a', `<img src="${movieData[4]}" alt="This is the poster for the movie ${movieData[0]}" class="posterImg">`, [['href', movieData[4]], ['target', '_blank']])

  // make an info div that holds 3 things
  const infoDiv = document.createElement('div')
  infoDiv.className = 'infoDiv'

  addToParent(infoDiv, 'p', 'Year: ' + movieData[1], [['class', 'largeP']])
  addToParent(infoDiv, 'p', 'IMDB ID: ' + movieData[2], [['class', 'smallP']])
  addToParent(infoDiv, 'p', 'Media Type: ' + movieData[3], [['class', 'smallP']])

  posterHolder.append(infoDiv)

  // now we will make another api call
  // using the title of the movie
  // to make a hidden div (acts as a drop down with a button)
  // dropDiv holds arrowDown and hiddenDiv
  const dropDiv = addToParent(movieDiv, 'div', 'Details', [['class', 'dropDiv']])

  // make downArrow with event listener to unhide or hide div
  const downArrow = addToParent(dropDiv, 'div', '', [['class', 'arrow-down']])

  const hiddenDiv = addToParent(dropDiv, 'div', '', [['class', 'hiddenDiv']])
  hiddenDiv.style.display = 'none'

  downArrow.addEventListener('click', () => {
    if (hiddenDiv.style.display === 'none') {
      hiddenDiv.style.display = 'block'
    } else {
      hiddenDiv.style.display = 'none'
    }
  })



  // we make the api call then load up our data into hiddenDiv
  // data > Title, Year, Rated, Released, Runtime
  // Genre, Director, Writer, Actors, Plot, Language
  // Ratings, Metascore, (some more but I don't need them)
  const movieURL = properURL(movieData[2], 'i=')
  axios.get(movieURL)
    .then((response) => {
      // console.log(response)
      const movieItems = response.data
      const actors = movieItems.Actors.split(', ')
      addToParent(hiddenDiv, 'h4', '<strong> Genre: </strong>' + movieItems.Genre, [])
      addToParent(hiddenDiv, 'h4', '<strong> Runtime: </strong>' + movieItems.Runtime, [])
      addToParent(hiddenDiv, 'h4', '<strong> Metascore: </strong>' + movieItems.Metascore, [])
      if (actors) {
        addToParent(hiddenDiv, 'h4', '<strong> Featuring: </strong>' + actors[0] + (actors[1] ? ', ' + actors[1] : '') + (actors[2] ? ', ' + actors[2] : ''), [])
      }
      addToParent(hiddenDiv, 'h4', '<strong> Plot: </strong>', [])
      addToParent(hiddenDiv, 'div', movieItems.Plot, [])
      //
    })





  // const hiddenDiv =

  // add the event listener to downArrow to unhide hiddenDiv

  // create a div that's hidden to start and make the

  return movieDiv
} // end of makeMovieDiv

// function that makes an element
// and adds it to a parent (as argument)
// adds innerText 
// also can handle an array of arrays of attrName and attrValue pairs

function addToParent(parent, type, inText, attrArr) {

  const thisElem = document.createElement(type)
  thisElem.innerHTML = inText

  if (attrArr) {
    for (attrPair of attrArr) {
      // for each attr pair of name and values,
      // add it to thisElem with setAttribute
      thisElem.setAttribute(attrPair[0], attrPair[1])
    }
  }

  parent.append(thisElem)
  // return it to let us grab it
  return thisElem
}

