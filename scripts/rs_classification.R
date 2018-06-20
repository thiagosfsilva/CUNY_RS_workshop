# Classification ml analysis

# Necessary packages
library(raster)
library(sp)
library(tibble)
library(dplyr)

# Import images
dry_season <- brick('~/Projects/CUNY_RS_workshop/L8_imgs/L8_dry_season_2014-2017.tif')
wet_season <- brick('~/Projects/CUNY_RS_workshop/L8_imgs/L8_wet_season_2014-2017.tif')

# Get training samples
training <- shapefile('~/Projects/CUNY_RS_workshop/shapefiles/training_samples.shp')

# Extract training samples
dry_samples <- extract(dry_season,training, df=T)
wet_samples <- extract(wet_season,training, df=T)
names(dry_samples) <- names(wet_samples) <- c('id','B1','B2','B3','B4','B5','B6','B7')

# Since the rasters are small, we can extract all values
dry_df <- as.tibble(values(dry_season))
wet_df <- as.tibble(values(wet_season))
names(dry_df) <- names(wet_df) <- c('B1','B2','B3','B4','B5','B6','B7')
# Now we have a matrix with 7 features (the bands)
# We can create some extra features

dry_samples <- dry_samples %>% 
    mutate(ndvi = (B5-B4)/(B5+B4),
           ndwi = (B6-B5)/(B6+B5))

wet_samples <- wet_samples %>% 
    mutate(ndvi = (B5-B4)/(B5+B4),
           ndwi = (B6-B5)/(B6+B5))    


dry_samples <- calc_features(dry_samples)
