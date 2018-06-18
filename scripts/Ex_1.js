var ROI = ee.Geometry.Rectangle([-47.98,-22.28, -47.80, -22.19]);
// order is xMin, yMin, xMax, yMax

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
    .filterBounds(ROI) 
    .filterDate('2005-01-01','2010-12-31')
    .filter(ee.Filter.calendarRange(1,90,'day_of_year'))

var first_image = ee.Image(L5.first())

Map.addLayer(first_image,{
  bands: ['B5', 'B4', 'B3'],
  min: [200, 200, 200],
  max: [3200, 3500, 2500]}
, 'First Image - Raw')

Map.centerObject(ROI, 13)

var cmasked = L5.map(mask_clouds)

var reduced = cmasked.reduce(ee.Reducer.median())

Map.addLayer(reduced,{
  bands: ['B5_median', 'B4_median', 'B3_median'],
  min: [200, 200, 200],
  max: [3200, 3500, 2500]}
, 'L5 Median Composite')

var ndvi = reduced.normalizedDifference(["B4_median", "B3_median"])

Map.addLayer(ndvi,{
  min: 0,
  max: 0.8,
  palette: ['#2c7bb6','#ffffbf','#a6d96a','#1a9641']
},'NDVI')