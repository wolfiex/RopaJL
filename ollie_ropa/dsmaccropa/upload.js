
//document.getElementById('loading').style.width='60%'


//Start event listener to check if a file has been selected
run = document.getElementById('files').addEventListener('change', handleFileSelect, false);


var reader;
var progress = document.getElementById('loading');//document.querySelector('.percent');

function abortRead() {  reader.abort(); }

function handleFileSelect(evt) {
  // Reset progress indicator on new file selection.
  document.getElementById('meterdiv').style.opacity= 1;
  progress.style.width = '0%';
  //progress.textContent = '0%';

  reader = new FileReader();
  reader.onerror = errorHandler;
  reader.onprogress = updateProgress;
  reader.onabort = function(e) {
    alert('File read cancelled');
  };
  reader.onloadstart = function(e) {

  };
  reader.onload = function(e) {

    // Ensure that the progress bar displays 100% at the end.
    progress.style.width = '100%';

    //replace reader with NetCDF reader
    reader = new netcdfjs(this.result);
    ncparse(reader);
    
    window.parent.postMessage({call:"id", value:window.id},"*");
    document.getElementById('filename').value = document.getElementById('files').value.split("\\")[2]



    document.getElementById('ropaelements').hidden=false;
    var elem = document.getElementById('input');
    elem.parentNode.removeChild(elem);
    

    

  }
  reader.readAsArrayBuffer(evt.target.files[0]);
}



function errorHandler(evt) {
  switch(evt.target.error.code) {
    case evt.target.error.NOT_FOUND_ERR:
      alert('File Not Found!'); break;
    case evt.target.error.NOT_READABLE_ERR:
      alert('File is not readable');break;
    case evt.target.error.ABORT_ERR: break;
    default: alert('An error occurred reading this file.');
  };
}

function updateProgress(evt) {
  // evt is an ProgressEvent. Updates progress bar
  if (evt.lengthComputable) {
    var percentLoaded = Math.round((evt.loaded / evt.total) * 100);
    // Increase the progress bar length.
    if (percentLoaded < 100) {
      progress.style.width = percentLoaded + '%';
      progress.textContent = percentLoaded + '%';
    }
  }
}
