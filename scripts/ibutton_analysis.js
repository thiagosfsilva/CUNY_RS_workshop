var ibutton = ee.FeatureCollection("users/thiagosfsilva/ibutton_locations")

var ibuttonbbox = ibutton.geometry().bounds().buffer(1000)

Map.addLayer(ibutton,{}, 'IButton locations')
Map.addLayer(ibuttonbbox,{}, "Ibutton BBox")
Map.centerObject(ibuttonbbox, 10)

var getQABits = function(image, start, end, newName) {
    var pattern = 0;
    for (var i = start; i <= end; i++) {
       pattern += Math.pow(2, i)
    }
    return image.select([0], [newName])
                  .bitwiseAnd(pattern)
                  .rightShift(start)
}

var mask_clouds = function(image) {
  var QA = image.select(['pixel_qa']);
  var shadow = getQABits(QA, 3,3, 'Cloud_shadows').eq(0);
  image = image.updateMask(shadow);
  var clouds = getQABits(QA, 5,5, 'Cloud').eq(0);
  image = image.updateMask(clouds)
  return image
}

var L5 = ee.ImageCollection('LANDSAT/LT05/C01/T1_SR')
    .filterBounds(ibuttonbbox) 
    .filterDate('2005-01-01','2010-12-31')

var L5_masked = L5.map(mask_clouds)

var vizParams = {
  min: 2730, //(0 C = 273K /0.1 = 2730)
  max: 3230,  //(50 C = 323K / 0.1 = 3230)
  palette: ['yellow','orange','red']
}

Map.addLayer(ee.Image(L5_masked.first()).select('B6'), vizParams, 'Masked first image')

var max_temp = L5_masked.max().select('B6').clip(ibuttonbbox)
var min_temp = L5_masked.min().select('B6').clip(ibuttonbbox)

Map.addLayer(max_temp,vizParams,"Maximum Temperature 2009-2010")
Map.addLayer(min_temp, vizParams, "Minimum Temperature 2009-2010")

// Now we can compute the Maximum NDVI as a vegetation precictor

var getNDVI = function(image){
  var ndvi = image.normalizedDifference(['B4','B3'])
  return(ndvi)
}

var L5_NDVI = L5_masked.map(getNDVI)

var max_ndvi = L5_NDVI.max().clip(ibuttonbbox)
var min_ndvi = L5_NDVI.min().clip(ibuttonbbox)

var ndvi_range = max_ndvi.subtract(min_ndvi)

Map.addLayer(max_ndvi,{min: -0.3, max: 1, palette: ['red','green']},"Max NDVI")
Map.addLayer(ndvi_range,{min: 0, max: 2, palette: ['red','green']}, "NDVI_range")

// Now we get topography

var alosdem = ee.Image('JAXA/ALOS/AW3D30_V1_1').select('MED').clip(ibuttonbbox)

var slope = ee.Terrain.slope(alosdem)

var aspect = ee.Terrain.aspect(alosdem)

Map.addLayer(slope,{min: 0, max: 5},"Slope")

Map.addLayer(aspect,{min: 0, max: 360},"Aspect")

// Now we can assemble all bands into a single set


