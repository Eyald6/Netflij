$(document).ready(function() {
 const tabItems = document.querySelectorAll('.tab-item');  
 const tabContentItems = document.querySelectorAll('.tab-content-item');  
 // Select tab content item  
 function selectItem(e) {  
      // Remove all show and border classes  
      removeBorder();  
      removeShow();  
      // Add border to current tab item  
      this.classList.add('tab-border');  
      // Grab content item from DOM  
      const tabContentItem = document.querySelector(`#${this.id}-content`);  
      // Add show class  
      tabContentItem.classList.add('show');  
 }  
 // Remove bottom borders from all tab items  
 function removeBorder() {  
      tabItems.forEach(item => {  
           item.classList.remove('tab-border');  
      });  
 }  
 // Remove show class from all content items  
 function removeShow() {  
      tabContentItems.forEach(item => {  
           item.classList.remove('show');  
      });  
 }  
 // Listen for tab item click  
 tabItems.forEach(item => {  
      item.addEventListener('click', selectItem);  
 });
});

function dragging(magicBox, e) {
  e.preventDefault();
  $(magicBox).find('img')[0].style = "border-color: rgba(164, 37, 228)";
};

function dragLeft(magicBox) {
  $(magicBox).find('img')[0].style = "border-color: #c6c6c6";
};

function onDrop(magicBox, e) {
  e.preventDefault();
  $(magicBox).find('img')[0].style = "border-color: #c6c6c6";
  const { files } = e.dataTransfer;
  previewImage(magicBox, files[0]);
};

function previewImage(magicBox, file) {
  $(magicBox).find('img')[0].src = URL.createObjectURL(file);
  $(magicBox).find('img')[0].data = file;
};

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

async function addShow(uid) {
     const background = await fetch(backgroundImage.src).then(resp => resp.blob());
     const logo = await fetch(logoImage.src).then(resp => resp.blob());
     const formData = new FormData();
     formData.append("title", title.value);
     formData.append("description", description.value);
     formData.append("genres", genres.value);
     formData.append("announcement", announcement.value);
     formData.append("logo", logo);
     formData.append("background", background);
     formData.append("approved", approved.value);
     if (uid != undefined) {
          formData.append("uid", uid);
     }
     fetch('/add', {
          method: 'POST',
          headers: {'X-CSRFToken': getCookie('csrftoken')},
          body: formData
     }).then(resp => resp.json()).then(data => {
          if (data.status) {
               window.location = '/admin'
          }
     })
}
function edit(uid) {
     window.location = `/edit?uid=${uid}`
}

function removeShow(uid) {
     const formData = new FormData();
     formData.append("uid", uid);
     fetch('/remove', {
          method: 'POST',
          headers: {'X-CSRFToken': getCookie('csrftoken')},
          body: formData
     }).then(resp => resp.json()).then(data => {
          if (data.status) {
               window.location = '/admin'
          }
     })
}