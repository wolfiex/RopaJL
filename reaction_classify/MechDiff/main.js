

const electron = require('electron');
const cp = require('child_process');
const ipc = electron.ipcMain;
const app = electron.app;  // Module to control application life.
const BrowserWindow = electron.BrowserWindow;  // Module to create native browser window.
const remote  = electron.remote;
const Menu = electron.Menu;
const MenuItem = electron.MenuItem;
const webContents = electron.webContents;
//ipc.send('toggle-prefs','la')


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform != 'darwin') {
        app.quit();
    }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {
    //sync init con files
    var child = cp.exec('bash ./src/updateics.sh', function (error, stdout, stderr) {  console.log('updated ics');  child.stdout.pipe(process.stdout);});
    cp.exec('touch heatmap.html && touch locations.json && rm heatmap.html && rm locations.json');
    console.log('add datafile to read from web, iff this older, update');

    //var execSync = require('exec-sync');
    //execSync('bash ./updateics.sh') ;
    //require('child_process').exec('python celulas.py', function (error, stdout, stderr) {    child.stdout.pipe(process.stdout);});


    // Create the browser window.
    const myLocation = 'file://' + __dirname
    mainWindow = new BrowserWindow({width:1551, height: 1227,resizable: true,title:'Dan Ellis 2016' ,
    show:true
      });
    mainWindow.openDevTools();    // and load the index.html of the app.
    mainWindow.loadURL( myLocation + '/index.html');


    splash = new BrowserWindow({width:800, height: 450,resizable: false ,title:'VisACC 2016' ,
    show:false      });
    splash.loadURL( myLocation + '/hexbin.html');
    splash.openDevTools();


    var prefsWindow = new BrowserWindow({
        width: 990,
        height: 140,
        show: false,
        title: 'This is where the magic happens'
      });


    prefsWindow.loadURL( myLocation + '/controls.html');
    prefsWindow.openDevTools();





    ipc.on('forwarder',(event,arg)=> {
    console.log(eval(arg[0]));
    eval(arg[0]).webContents.send('data' , {name:arg[1],values:arg[2]});
    //can send directly.

    ipc.on('decimate',(event,arg)=> {app.quit()});

    ipc.on('closewindow',(event,arg)=> {eval(arg[0]).close()});

    ipc.on('show',(event,arg)=> {eval(arg[0]).show()});


  });


/*
    ipc.on('toggle-prefs', (event,arg)=> {
    if (prefsWindow.isVisible())
      prefsWindow.hide()
    else
      prefsWindow.show()
  });

  getWindow('windowName').webContents.send('info' , {msg:'hello from main process'});



*/

///menu
/*
      var fileMenu = new Menu();
      fileMenu.append(new MenuItem({ label: "Save Image", accelerator: "Ctrl+s", click: function() {
          fileMenu.clear(); //editMenu.append(new MenuItem({ label: "Dummy2", accelerator: "Ctrl+P", click: function() {
          //}}));
      }}));
      fileMenu.append(new MenuItem({ label: "Quit", accelerator: "Ctrl+q", role:'quit' }));

      var editMenu = new Menu();
      editMenu.append(new MenuItem({ label: "New DataFile", accelerator: "Ctrl+n",  click:function(){console.log('hi');mainWindow.webContents.send('toggle-prefs' ,'hello from main process')}}));
//function(){alert('add new data here')}}));

var saveMenu = new Menu();
saveMenu.append(new MenuItem({ label: "save", accelerator: "Ctrl+s",  click:function(){mainWindow.webContents.send('command' ,'canvas2file(canvas)')}}));

      var visMenu = new Menu({});


      var menubar = new Menu();
      menubar.append(new MenuItem({ label: "File", submenu: fileMenu }));
      menubar.append(new MenuItem({ label: "Edit", submenu: editMenu }));
      menubar.append(new MenuItem({ label: "Change Visual Style", submenu: visMenu }));
      menubar.append(new MenuItem({ label: "Save", submenu: saveMenu }));
      Menu.setApplicationMenu(menubar);


*/

      function getWindow(windowName) {
        for (var i = 0; i < windowArray.length; i++) {
          if (windowArray[i].name == windowName) {
            return windowArray[i].window;
          }
        }
        return null;
      }





    // Emitted when the window is closed.
    mainWindow.on('closed', function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
        prefsWindow=null;
        app.quit();
// make a function to trigger
    });
});
