var React = require('react')

var Form = function(props) {
  return (
    <div id='addEditForm'>
      <img id="close" src="/public/images/close-icon.png" onClick={props.popup} />
      <div>
        <label>Image Url *</label>
        <div>
          <input id='form_0' className='addEditFormInput' type='text' onKeyDown={props.input} />
        </div>
      </div>
      <div>
        <label>Title *</label>
        <div>
          <input id='form_1' className='addEditFormInput' type='text' onKeyDown={props.input} />
        </div>
      </div>
      <div>
        <label>Comment</label>
        <div>
          <input id='form_2' className='addEditFormInput' type='text' onKeyDown={props.input} />
        </div>
      </div>
      <div>Required fields marked *</div>
      <div id='editNote' style={{display: 'none'}}>**Editing resets likes and dislikes**</div>
      <button id='submitButton' onClick={props.addEdit}></button>
      <span id='message' className='message'>Filler</span>
    </div>
  )
}

module.exports = Form
