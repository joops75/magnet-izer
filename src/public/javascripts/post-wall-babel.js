var React = require('react')
var ReactDOM = require('react-dom')
import ReactDOMServer from 'react-dom/server'
var Masonry = require('react-masonry-component')
var masonryOptions = {
    transitionDuration: 500
}
var Layout = require('masonry-layout')
var grid
var msnry
var Form = require('./form-babel')
var magnetCount = -1
var addEdit
var eId
var messageLocation
var maxTitleLength = 40
var maxCommentLength = 100
var deletedMagnetIndexes = []
var style
page === '/my-post-wall' ? style = { display: '' } : style = { display: 'none' }

class DisplayWall extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      users: []
    }
    this.popup = this.popup.bind(this)
    this.input = this.input.bind(this)
    this.delete = this.delete.bind(this)
    this.error = this.error.bind(this)
    this.addEdit = this.addEdit.bind(this)
    this.likeDislike = this.likeDislike.bind(this)
  }
  componentWillMount() {
    page === '/my-post-wall' ? this.getMyMagnets() : this.getAllMagnets()
  }
  getMyMagnets() {
    $.get('/api/getMyMagnets', (data, status) => {
      this.setState({ users : data })
    })
  }
  getAllMagnets() {
    $.get('/api/getAllMagnets', (data, status) => {
      this.setState({ users : data })
    })
  }
  componentDidMount() {
    grid = document.querySelector('.grid')
    msnry = new Layout( grid, {
      columnWidth: 240, // = img width + 2 * (magnet padding + border width) (set in sass file)
      itemSelector: '.magnet'
    })
    if (page === '/my-post-wall') {
      msnry.stamp(document.querySelector('.stamp'))
      var popupButton = document.querySelector('#popupButton')
      popupButton.addEventListener("click", this.popup)
    }
  }
  popup(e) {
    if (e) eId = e.target.id
    if (eId === 'popupButton') {
      addEdit = 'add'
      document.querySelector('#editNote').style.display = 'none'
      document.querySelector('#submitButton').textContent = 'Add'
    } else if (eId === 'close') {
      addEdit = 'close'
    } else {
      addEdit = 'edit'
      document.querySelector('#editNote').style.display = ''
      document.querySelector('#submitButton').textContent = 'Edit'
    }
    if (addEdit === 'edit') {
      var userIndex = eId.split('_')[1]
      var userMagnetIndex = eId.split('_')[2]
      var magnetIndex = eId.split('_')[3]
      var url = this.state.users[userIndex].magnets[userMagnetIndex].url
      document.querySelector('#form_0').value = url
      var title = this.state.users[userIndex].magnets[userMagnetIndex].title
      document.querySelector('#form_1').value = title
      var comment = this.state.users[userIndex].magnets[userMagnetIndex].comment
      document.querySelector('#form_2').value = comment
    }
    var screenArea = document.querySelector('#screenArea')
    if (screenArea.style.display === 'none') {
      screenArea.style.display = 'block'
    } else {
      document.querySelector('#form_0').value = ''
      document.querySelector('#form_1').value = ''
      document.querySelector('#form_2').value = ''
      screenArea.style.display = 'none'
    }
  }
  addEdit() {
    messageLocation = null
    addEdit === 'add' ? this.add() : this.edit()
  }
  input(e) {
    if (e.which === 13) this.addEdit()
    if (e.which !== 8 && e.which !== 46 && e.which !== 37 && e.which !== 39) {
      if (e.target.id === 'form_1' && e.target.value.length >= maxTitleLength) e.preventDefault()
      if (e.target.id === 'form_2' && e.target.value.length >= maxCommentLength) e.preventDefault()
    }
  }
  add() {
    var url = document.querySelector('#form_0').value
    var title = this.trim(document.querySelector('#form_1').value, '#form_1')
    var comment = this.trim(document.querySelector('#form_2').value, '#form_2')
    if (!url || !title) {
      this.displayMessage(' Form incomplete!')
    } else {
      document.querySelector('#form_0').value = ''
      document.querySelector('#form_1').value = ''
      document.querySelector('#form_2').value = ''
      this.popup()

      var magnet = {}
      magnet.url = url
      magnet.title = title
      magnet.comment = comment
      magnet.likes = []
      magnet.dislikes = []
      magnet.id = id

      $.post('/api/addDatabaseMagnet', {magnet: magnet}, (data, status) => {
        if (status === 'success') {
          this.state.users[0].magnets.push(magnet)
          this.state.users[0].local && this.state.users[0].local.username ? magnet.poster = [this.state.users[0].local.username, 'local'] : this.state.users[0].twitter && this.state.users[0].twitter.username ? magnet.poster = [this.state.users[0].twitter.username, 'twitter'] : magnet.poster = [null, null]
          magnet.userIndex = 0
          magnetCount++
          magnet.userMagnetIndex = magnetCount
          var newDomElementString = ReactDOMServer.renderToStaticMarkup(<Magnet key={magnetCount} magnet={magnet} i={magnetCount} />)
          var newDomElement = $.parseHTML(newDomElementString)[0]
          // newDomElement.firstChild.addEventListener("error", this.error)
          var fragment = document.createDocumentFragment()
          fragment.appendChild(newDomElement)
          grid.appendChild(fragment)
          msnry.appended(newDomElement)
          // need to add event listeners manually as renderToStaticMarkup removes them
          var image = document.querySelector('#image_' + magnetCount)
          setTimeout(() => { image.addEventListener("error", this.error) }, 100) // delayed add to avoid instant error triggering
          var deleteButton = document.querySelector('#delete_' + magnetCount)
          deleteButton.addEventListener("click", this.delete)
          var editButton = document.querySelector('#edit_' + 0 + '_' + magnetCount + '_' + magnetCount)
          editButton.addEventListener("click", this.popup)
          var likeButton = document.querySelector('#like_' + 0 + '_' + magnetCount + '_' + magnetCount)
          likeButton.addEventListener("click", this.likeDislike)
          var dislikeButton = document.querySelector('#dislike_' + 0 + '_' + magnetCount + '_' + magnetCount)
          dislikeButton.addEventListener("click", this.likeDislike)
          msnry.reloadItems()
          msnry.layout()
        }
      })
    }
  }
  error(e) {
    var magnetIndex = e.target.id.split('_')[1]
    document.querySelector('#image_' + magnetIndex).removeEventListener("error", this.error)
    document.querySelector('#image_' + magnetIndex).src = '/public/images/NoImageAvailable.png'
    setTimeout(() => { msnry.reloadItems(); msnry.layout() }, 100) // delayed layout() otherwise magnets won't rearrange
  }
  edit() {
    var url = document.querySelector('#form_0').value
    var title = this.trim(document.querySelector('#form_1').value, '#form_1')
    var comment = this.trim(document.querySelector('#form_2').value, '#form_2')
    if (!url || !title) {
      this.displayMessage(' Form incomplete!')
    } else {
      var userIndex = eId.split('_')[1]
      var userMagnetIndex = eId.split('_')[2]
      var magnetIndex = eId.split('_')[3]
      var adjustedMagnetIndex = this.adjustMagnetIndex(parseInt(magnetIndex, 10))

      var magnet = this.state.users[userIndex].magnets[userMagnetIndex]
      magnet.url = url
      magnet.title = title
      magnet.comment = comment
      magnet.likes = []
      magnet.dislikes = []

      $.post('/api/editDatabaseMagnet', {magnet: magnet, index: adjustedMagnetIndex}, (data, status) => {
        if (status === 'success') {
          this.state.users[userIndex].magnets.splice(userMagnetIndex, 1)
          this.state.users[userIndex].magnets.splice(userMagnetIndex, 0, magnet)

          var magnetNode = document.querySelector('#magnet_' + magnetIndex)
          var childNodes = magnetNode.childNodes
          for (let i = 0; i < 3; i++) {
            var childNode = magnetNode.childNodes[i]
            var newChildNode = document.createElement(childNode.nodeName)
            var text = this.trim(document.querySelector('#form_' + i).value, '#form_' + i)
            if (childNode.nodeName === 'IMG') {
              newChildNode.id = 'image_' + magnetIndex
              newChildNode.src = text
              newChildNode.addEventListener("error", this.error)
            } else {
              newChildNode.textContent = text
            }
            magnetNode.replaceChild(newChildNode, childNode)
            document.querySelector('#form_' + i).value = ''
          }
          document.querySelector('#likes_' + userIndex + '_' + userMagnetIndex + '_' + magnetIndex).textContent = 0
          document.querySelector('#dislikes_' + userIndex + '_' + userMagnetIndex + '_' + magnetIndex).textContent = 0
          msnry.layout()
          this.popup()
        }
      })
    }
  }
  adjustMagnetIndex(magnetIndexIntegar) {
    var count = 0
    for (let i = 0; i < deletedMagnetIndexes.length; i++) {
      if (deletedMagnetIndexes[i] < magnetIndexIntegar) count++
    }
    return magnetIndexIntegar - count
  }
  displayMessage(message) {
    var selector
    messageLocation ? selector = $(messageLocation) : selector = $('#message')
    selector[0].textContent = message
    selector.css('visibility', 'visible')
    selector.fadeOut(3000, function() {//function actions performed AFTER fadeOut
      selector.css('display', '')
      selector.css('visibility', 'hidden')
    })
  }
  trim(text, location) {
    if (text.length > maxTitleLength && location === '#form_1') return text.slice(0, maxTitleLength)
    if (text.length > maxCommentLength && location === '#form_2') return text.slice(0, maxCommentLength)
    return text
  }
  delete(e) {
    var magnetIndex = e.target.id.split('_')[1]
    var adjustedMagnetIndex = this.adjustMagnetIndex(parseInt(magnetIndex, 10))
    $.post('/api/deleteDatabaseMagnet', {index: adjustedMagnetIndex}, (data, status) => {
      if (status === 'success') {
        var magnetNode = document.querySelector('#magnet_' + magnetIndex)
        msnry.reloadItems() // must be added before msnry.remove or else delete won't work as a first command after page refresh
        msnry.remove(magnetNode)
        msnry.layout()
        deletedMagnetIndexes.push(parseInt(magnetIndex, 10))
      }
    })
  }
  likeDislike(e) {
    var sentiment = e.target.id.split('_')[0]
    var userIndex = e.target.id.split('_')[1]
    var userMagnetIndex = e.target.id.split('_')[2]
    var magnetIndex = e.target.id.split('_')[3]
    var adjustedMagnetIndex
    page === '/my-post-wall' ? adjustedMagnetIndex = this.adjustMagnetIndex(parseInt(magnetIndex, 10)) : adjustedMagnetIndex = userMagnetIndex
    messageLocation = '#sentimentMessage_' + userIndex + '_' + userMagnetIndex + '_' + magnetIndex
    var likeNode = document.querySelector('#likes_' + userIndex + '_' + userMagnetIndex + '_' + magnetIndex)
    var dislikeNode = document.querySelector('#dislikes_' + userIndex + '_' + userMagnetIndex + '_' + magnetIndex)
    var magnet = this.state.users[userIndex].magnets[userMagnetIndex]
    if (!id) {
      this.displayMessage('please login!')
    } else {
      if (sentiment === 'like') {
        if (magnet.likes.indexOf(id) === -1) {
          $.post('/api/likeDatabaseMagnet', {magnet: magnet, index: adjustedMagnetIndex}, (data, status) => {
            if (status === 'success') {
              magnet.likes.push(id)
              if (magnet.dislikes.indexOf(id) > -1) magnet.dislikes.splice(magnet.dislikes.indexOf(id), 1)
              likeNode.textContent = magnet.likes.length
              dislikeNode.textContent = magnet.dislikes.length
            }
          })
        } else {
          this.displayMessage('already liked')
        }
      } else {
        if (magnet.dislikes.indexOf(id) === -1) {
          $.post('/api/dislikeDatabaseMagnet', {magnet: magnet, index: adjustedMagnetIndex}, (data, status) => {
            if (status === 'success') {
              magnet.dislikes.push(id)
              if (magnet.likes.indexOf(id) > -1) magnet.likes.splice(magnet.likes.indexOf(id), 1)
              likeNode.textContent = magnet.likes.length
              dislikeNode.textContent = magnet.dislikes.length
            }
          })
        } else {
          this.displayMessage('already disliked')
        }
      }
    }
  }
  render() {
    var users = this.state.users
    var magnets = []
    for (let i = 0; i < users.length; i++) {
      for (let j = 0; j < users[i].magnets.length; j++) {
        var magnet = users[i].magnets[j]
        users[i].local && users[i].local.username ? magnet.poster = [users[i].local.username, 'local'] : users[i].twitter && users[i].twitter.username ? magnet.poster = [users[i].twitter.username, 'twitter'] : magnet.poster = magnet.poster = [null, null]
        magnet.userIndex = i
        magnet.userMagnetIndex = j
        magnets.push(magnet)
      }
    }
    return (
      <div>
        <div id="screenArea" style={{display: 'none'}}>
          <Form popup={this.popup} addEdit={this.addEdit} input={this.input} />
        </div>
        <div id="magnets">
          <Magnets magnets={magnets} delete={this.delete} popup={this.popup} error={this.error} likeDislike={this.likeDislike} />
        </div>
      </div>
    )
  }
}

var Magnets = function(props) {
  var addTile = <AddTile />
  var childElements = props.magnets.map(function(magnet, i){
    magnetCount = i * 1
    return (
      <Magnet key={i} magnet={magnet} i={i} delete={props.delete} popup={props.popup} error={props.error} likeDislike={props.likeDislike} />
    )
  })
  return (
    <Masonry
      className={'grid'}
      elementType={'div'}
      options={masonryOptions}
      disableImagesLoaded={true}
      updateOnEachImageLoad={false}
    >
      {addTile}
      {childElements}
    </Masonry>
  )
}

var Magnet = function(props) {
  if (!props.magnet.comment) props.magnet.comment = ''
  if (!props.magnet.likes) props.magnet.likes = []
  if (!props.magnet.dislikes) props.magnet.dislikes = []
  return (
    <div id={'magnet_' + props.i} className="magnet">
      <img id={'image_' + props.i} src={props.magnet.url} onError={props.error} />
      <h3>{props.magnet.title}</h3>
      <p>{props.magnet.comment}</p>
      <p>by: {props.magnet.poster[0]} ({props.magnet.poster[1]})</p>
      <div>
        <span><i id={'like_' + props.magnet.userIndex + '_' + props.magnet.userMagnetIndex + '_' + props.i} className='fa fa-thumbs-o-up' onClick={props.likeDislike}></i> <span id={'likes_' + props.magnet.userIndex + '_' + props.magnet.userMagnetIndex + '_' + props.i}>{props.magnet.likes.length}</span></span>
        <span><i id={'dislike_' + props.magnet.userIndex + '_' + props.magnet.userMagnetIndex + '_' + props.i} className='fa fa-thumbs-o-down' onClick={props.likeDislike}></i> <span id={'dislikes_' + props.magnet.userIndex + '_' + props.magnet.userMagnetIndex + '_' + props.i}>{props.magnet.dislikes.length}</span></span>
        <div id={'sentimentMessage_' + props.magnet.userIndex + '_' + props.magnet.userMagnetIndex + '_' + props.i} className='sentimentMessage'>Filler</div>
      </div>
      <div>
        <button id={'delete_' + props.i} style={style} onClick={props.delete}>Delete</button>
        <button id={'edit_' + props.magnet.userIndex + '_' + props.magnet.userMagnetIndex + '_' + props.i} onClick={props.popup} style={style}>Edit</button>
      </div>
    </div>
  )
}

var AddTile = function(props) {
  if (page === '/my-post-wall') {
    return (
      <div className="stamp">
        <p>Add a new magnet</p>
        <button id='popupButton'>Add</button>
      </div>
    )
  } else {
    return null
  }
}

ReactDOM.render(<DisplayWall />, document.getElementById('target'))
