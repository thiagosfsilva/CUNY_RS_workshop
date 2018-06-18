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

var L8 = ee.ImageCollection('LANDSAT/LC08/C01/T1_SR')
    .filterBounds(ROI) 
    .filterDate('2014-01-01','2017-12-31')
    
var L8_wet = L8.filter(ee.Filter.calendarRange(1,90,'day_of_year'))
var L8_dry = L8.filter(ee.Filter.calendarRange(152,243,'day_of_year'))

var L8_wet_comp = L8_wet.map(mask_clouds).median().clip(ROI)
var L8_dry_comp = L8_dry.map(mask_clouds).median().clip(ROI)

var vizParam = {bands: ['B6', 'B5', 'B4'], min: [200, 200, 200], max: [3200, 3500, 2500]}

Map.addLayer(L8_wet_comp, vizParam, 'L5 Wet Season Composite')
Map.addLayer(L8_dry_comp, vizParam, 'L5 Dry Season Composite')

Map.centerObject(ROI, 13)

Export.image.toDrive({
  image: L8_wet_comp,
  description: 'L8_wet_season_2014-2017',
  scale: 30
})

Export.image.toDrive({
  image: L8_dry_comp,
  description: 'L8_dry_season_2014-2017',
  scale: 30
})