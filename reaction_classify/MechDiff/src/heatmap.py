''' open locations '''
import sys,json,os
width = (sys.argv[1])
height = (sys.argv[2])
radius = int(sys.argv[3])

#os.chdir("..")

with open(os.getcwd()+'/locations.json') as data_file:
    data = json.load(data_file)

datastring = ''
vals=[]
for node in data['nodes']:

    #values=1#*(node['vx']**2 + node['vy']**2)**0.5
    values = int(node['s']*3)
    datastring += '{x: %d, y: %d, value: %d, radius:%d},'%( node['x'], node['y'], values , radius*values)
    vals.append(values)

filedata = '''<!doctype html>
<html>
<head><meta charset='utf-8'></head>
<body>
<div id='container' style='height: ''' + height + '''px'>
    <canvas id='heatMap' width = " '''+ width + '''px" height = "''' +height+ '''px" style='position:absolute'></canvas>
</div>

<script src='./src/heatmap.min.js'>
</script>

<script>
  var heatmapInstance = h337.create({
      container: document.getElementById('container'),
      //radius:1000,
      //defaultGradient: { 0.25: "rgb(0,0,255)", 0.55: "rgb(0,255,0)", 0.8: "yellow", 1.0: "rgb(255,0,0)"},
      defaultGradient: { 0.45: "rgb(0,0,255)", 0.65: "rgb(0,255,0)", 0.8: "yellow", 1.0: "rgb(255,0,0)"},
      defaultMaxOpacity: 0.45,
      defaultMinOpacity: 0,
      defaultBlur: 0.6,
  });

  var testData = {
        min: 0 ,
        max: '''+ str(max(vals))+''',
        data: ['''+datastring+''']
  };
  heatmapInstance.setData(testData);
</script>
</body>
</html>'''


with open(os.getcwd()+'/heatmap.html', 'w') as html:  html.write(filedata)
print 'heatmap.html written'
