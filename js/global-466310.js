
(function() {
  // Root init function
  colorSubheadings();

  var sidebar = document.querySelector('.chapter-sidebar');
  if (sidebar) {
    initializeChapterSidebar();
  }

  var mailingListForm = document.querySelector('.js-about__mailing-list-form');
  if (mailingListForm) {
    initializeMailingListForm();
  }

  insertObfuscatedEmails();
})();


function initializeMailingListForm() {
  var mailingListForm = document.querySelector('.js-about__mailing-list-form');
  var mailingListEmail = document.querySelector('.js-about__mailing-list-email');
  var mailingListButton = document.querySelector('.js-about__mailing-list-button-link');
  var mailingListStatus = document.querySelector('.js-about__mailing-list-status');
  var mailingListStatusTitle = document.querySelector('.js-about__mailing-list-status-title');
  var mailingListStatusText = document.querySelector('.js-about__mailing-list-status-text');
  var mailingListRow = document.querySelector('.js-about__mailing-list-row');


  if (mailingListForm) {
    mailingListForm.addEventListener('submit', function(e) {
      e.preventDefault();
      e.stopPropagation();

      // Collect input
      var data = {};
      data.email = mailingListEmail.value;

      // Reset validation errors
      mailingListEmail.classList.remove('input-text--error');
      mailingListStatus.classList.remove('input-status--error');

      // Validate input
      var mailingListConstraints = {
        email: {
          presence: {
            message: 'You can’t sign up for a mailing list without an email address...'
          },
          email: {
            message: "That’s obviously not an email address..."
          }
        }
      }
      var validation = validate(data, mailingListConstraints, {fullMessages: false});
      if (validation) {
        // Show the error message (there will always be an error in this array)
        mailingListStatusTitle.textContent = 'Error!';
        mailingListStatusText.textContent = validation.email[0];

        // Highlight the error input element
        mailingListEmail.classList.add('input-text--error');
        mailingListStatus.classList.add('input-status--error');
        slideDown(mailingListStatus.parentNode);
        return;
      }

      // Show the "Working" status message
      slideDown(mailingListStatus.parentNode);
      mailingListStatusTitle.textContent = 'Working...';
      mailingListStatusText.textContent = '(this shouldn’t take long)';

      // Disable the button while waiting for request to process
      mailingListEmail.disabled = true;
      mailingListButton.disabled = true;


      // Send the input to the server
      axios.post('/api/v1.0/mailing-list', {

        'email': data.email,
        'signupPage': window.location.pathname

      }).then(function(response) {

        // Success! Show a success message
        mailingListStatus.classList.add('input-status--success');
        mailingListStatusTitle.textContent = 'Success!';
        mailingListStatusText.textContent = 'Please check your inbox to confirm your address';
        slideUp(mailingListRow.parentNode);
        slideDown(mailingListStatus.parentNode);

      }).catch(function(error) {

        // Re-enable the form
        mailingListEmail.disabled = false;
        mailingListButton.disabled = false;

        mailingListEmail.classList.add('input-text--error');
        mailingListStatus.classList.add('input-status--error');
        mailingListStatusTitle.textContent = 'Error!';
        
        var knownError = false;
        if (error.response) {
          // Respond to known error states
          var errorInfo = error.response.data;
          if (errorInfo.error === 'already pending') {
            mailingListStatusText.textContent = 'You’ve already subscribed to our mailing list. Check your inbox to confirm your address.';
            knownError = true;
          } else if (errorInfo.error === 'already subscribed') {
            mailingListStatusText.textContent = 'You’re already on our mailing list (we appreciate the enthusiasm)';
            knownError = true;
          }
        }

        if (!knownError) {
          // Something very bad happened
          mailingListStatusText.innerHTML = "Looks like our mailing list is broken. Please <a href='/contact/' target='_blank'>let us know</a>.";
        }

        // Show the error status box (NOTE: This messes up smooth animation,
        // but ensures the entire error text is visible)
        slideDown(mailingListStatus.parentNode);

      });
    });
  }

}


function insertObfuscatedEmails() {
  // Replace email text
  var emailTexts = document.querySelectorAll('.js-obfuscated-email__text');
  if (emailTexts) {
    for (var i=0; i<emailTexts.length; i++) {
      emailTexts[i].innerHTML = getCleartextEmail();
    }
  }

  // Add email href='mailto:'
  var emailMailTos = document.querySelectorAll('.js-obfuscated-email__mailto');
  if (emailMailTos) {
    for (var i=0; i<emailMailTos.length; i++) {
      emailMailTos[i].setAttribute('href', 'mailto:' + getCleartextEmail());
    }
  }

  function getCleartextEmail() {
    var rot13Email = 'pbagnpg@vagreargvatvfuneq.pbz';
    return rot13Email.replace(/[a-zA-Z]/g, function(c){
      return String.fromCharCode((c<='Z'?90:122)>=(c=c.charCodeAt(0)+13)?c:c-26);
    });
  }
}

function colorSubheadings() {
  // Replace subheading background colors
  var redStart = 255;
  var greenStart = 255;
  var blueStart = 255;
  var redEnd = 249;
  var greenEnd = 250;
  var blueEnd = 251;

  var redDiff = redEnd - redStart;
  var greenDiff = greenEnd - greenStart;
  var blueDiff = blueEnd - blueStart;

  var page = document.querySelector('.page');
  var pageHeight = page.offsetHeight;

  var subheadings = document.querySelectorAll('.subheading');
  for(var i = 0; i < subheadings.length; i++){
    // Get the position relative to .page
    var span = subheadings[i].querySelector('span');
    var factor = span.offsetTop / pageHeight;

    var r = Math.floor(redDiff * factor + redStart);
    var g = Math.floor(greenDiff * factor + greenStart);
    var b = Math.floor(blueDiff * factor + blueStart);
    var color = 'rgb('+r+','+g+','+b+')';

    // Color background based on position
    span.style.backgroundColor = color;
    span.style.boxShadow = '11px 0 0 '+color+', -13px 0 0 '+color;
  }
}

function initializeChapterSidebar() {

  function onScrollEventHandler(ev) {
    // --- Sticky Sidebar ---

    var sidebar = document.querySelector('.chapter-sidebar');
    var header = document.querySelector('.page-header');
    var headerBottom = header.getBoundingClientRect().bottom;

    if (headerBottom <= 42) {
      // Make it sticky
      addClass(sidebar, 'chapter-sidebar--sticky');
    } else {
      // Make it not stick
      removeClass(sidebar, 'chapter-sidebar--sticky');
    }


    // --- Sidebar Link Highlight ---

    // Reset the highlighted sidebar link(s)
    var highlightedLinks = document.querySelectorAll('.sidebar__link--highlight');
    for (var i=0; i<highlightedLinks.length; i++) {
      removeClass(highlightedLinks[i], 'sidebar__link--highlight');
    }

    var headings = document.querySelectorAll('.subheading__heading');
    for (var i=headings.length-1; i>=0; i--) {
      var heading = headings[i];
      var rect = heading.getBoundingClientRect();

      // -40 is for .subheading top padding
      if (rect.top < window.innerHeight - window.innerHeight/2 - 40) {
        // Go find the matching element in the sidebar and highlight it
        // Get the first visible one (need to subtract window height)
        var headingID = heading.getAttribute('id');
        var sidebarLinks = document.querySelectorAll('.sidebar__link');
        for (var j=0; j<sidebarLinks.length; j++) {
          var sidebarLink = sidebarLinks[j];
          var href = sidebarLink.getAttribute('href').substring(1);
          if (href === headingID) {
            // Found it
            addClass(sidebarLink, 'sidebar__link--highlight');
          }
        }
        break;
      }
    }
  }

  if(window.addEventListener) {
    window.addEventListener('scroll', throttle(onScrollEventHandler, 15), false);
  } else if (window.attachEvent) {
    window.attachEvent('onscroll', throttle(onScrollEventHandler, 15));
  }
}

// --- Utils ---

function throttle (callback, limit) {
  var wait = false;
  return function () {
    if (!wait) {
      callback.call();
      wait = true;
      setTimeout(function () {
        wait = false;
        }, limit);
      }
    }
}

function addClass(element, className) {
  if (element.classList) {
    element.classList.add(className);
  } else {
    // Don't add more than once
    if (element.className.indexOf(className) === -1) {
      element.className += ' ' + className;
    }
  }
}

function removeClass(element, className) {
  if (element.classList) {
    element.classList.remove(className);
  } else {
    element.className = element.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
  }
}

function getHeight(originalElement) {
  // Calculate height based on *cloned* element to avoid messing up styles
  var element = originalElement.cloneNode(true);
  originalElement.parentNode.replaceChild(element, originalElement);

  // Set styles to make sure it's going to calculate the correct height
  element.style.display = 'block';
  element.style.visibility = 'hidden';
  element.style.height = 'auto';

  var desiredHeight = element.offsetHeight;

  // Replace the cloned element with the original one
  element.parentNode.replaceChild(originalElement, element);

  return desiredHeight;
}

function slideDown(originalElement) {
  var desiredHeight = getHeight(originalElement);
  setTimeout(function(timestamp) {
    originalElement.style.height = desiredHeight + 'px';
  }, 1);
}

function slideUp(originalElement) {
  // Can't transition from an auto height, so make sure it's explicit
  var currentHeight = getHeight(originalElement);
  originalElement.style.height = currentHeight + 'px';
  setTimeout(function(timestamp) {
    originalElement.style.height = 0 + 'px';
  }, 1);
}

function getParameterByName(name, url) {
  if (!url) {
    url = window.location.href;
  }
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
  results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

