library(tidyverse)
library(sf)
library(fuzzyjoin)
library(readxl)
library(jsonlite)

######
### Download, clean, and merge price data
######

ecp <- read_csv("https://raw.githubusercontent.com/g-dolphin/ECP/master/_dataset/price/ecp_economy/ecp_CO2.csv")
tcov <- read_csv("https://raw.githubusercontent.com/g-dolphin/ECP/master/_dataset/coverage/tot_coverage_jurisdiction_CO2.csv")

ecp_sel <- ecp %>% select(jurisdiction, year, ecp_tax_jurCO2_kusd, ecp_ets_jurCO2_kusd, ecp_all_jurCO2_kusd)
tcov_sel <- tcov %>% select(jurisdiction, year, cov_tax_CO2_jurCO2, cov_ets_CO2_jurCO2, cov_all_CO2_jurCO2)

df <- left_join(ecp_sel, tcov_sel, by = c("jurisdiction", "year")) %>%
      rename(region = jurisdiction,
             year = year,
             ecp_tax = ecp_tax_jurCO2_kusd,
             ecp_ets = ecp_ets_jurCO2_kusd,
             ecp_all = ecp_all_jurCO2_kusd,
             cov_tax = cov_tax_CO2_jurCO2,
             cov_ets = cov_ets_CO2_jurCO2,
             cov_all = cov_all_CO2_jurCO2) 

      # mutate(region = str_remove(region, ",.*$"))

# Country codes
codes <- read_csv("https://gist.githubusercontent.com/tadast/8827699/raw/f5cac3d42d16b78348610fc4ec301e9234f82821/countries_codes_and_coordinates.csv")
missing_names <- read_xlsx("alternative_names.xlsx")

geocoded_df <- left_join(df, codes, by = c("region" = "Country")) %>%
                rename(alpha_2 = `Alpha-2 code`,
                       alpha_3 = `Alpha-3 code`,
                       num_code = `Numeric code`,
                       ctry_avg_lat = `Latitude (average)`,
                       ctry_avg_long = `Longitude (average)`)

geocoded_df <- stringdist_left_join(geocoded_df, missing_names, by = c("region" = "ECP")) %>%
                mutate(alpha_3 = case_when(is.na(alpha_3) ~ Codes,
                                           TRUE ~ alpha_3)) %>%
                select(-ECP, -Codes) %>%
                mutate(country = ifelse(!is.na(alpha_3), "true", "false")) %>%
                mutate(region = case_when(region == "Yukon" ~ "Yukon Territory",
                                          TRUE ~ region))
            
# Processed price data
write.csv(geocoded_df, "processed_data.csv")

# Local record of data dependencies
write.csv(ecp, "./local_copy_data_dependencies/ecp.csv")
write.csv(tcov, "./local_copy_data_dependencies/tcov.csv")
write.csv(codes, "./local_copy_data_dependencies/countries_codes_and_coordinates.csv")


####
# Edit china geojson
####

myData <- fromJSON("gadm36_CHN_1.json") 

modData <- myData

up_china_names <- c("Anhui Province"    ,      "Beijing Municipality"    ,   "Chongqing Municipality"  ,    "Fujian Province"       ,  "Gansu Province" ,
                    "Guangdong Province"   ,   "Guangxi Zhuang Autonomous Region"     ,   "Guizhou Province"     ,   "Hainan Province"     ,   
                    "Hebei Province"     ,     "Heilongjiang Province" ,  "Henan Province"     ,     "Hubei Province"    ,      "Hunan Province"   ,      
                    "Jiangsu Province"   ,     "Jiangxi Province"   ,     "Jilin Province"    ,      "Liaoning Province"   ,   
                    "Inner Mongolia Autonomous Region"  ,   "Ningxia Hui Autonomous Region"  ,  "Qinghai Province"    ,    "Shaanxi Province"   ,     
                    "Shandong Province"    ,   "Shanghai Municipality"   ,    "Shaanxi Province"    ,     "Sichuan Province"   ,     "Tianjin Municipality"     ,  
                    "Xinjiang Uyghur Autonomous Region" , "Tibet Autonomous Region"      ,   "Yunnan Province"  ,       "Zhejiang Province")  

modData[[2]][[3]] <- modData[[2]][[3]] %>% select(NAME_1) %>% mutate(NAME_1 = up_china_names)

write_json(modData, "gadm36_CHN_1_upnames.json")


# From https://github.com/g-dolphin/ECP/blob/master/_code/compilation/dependencies/jur_names_concordances.py : 

# 'Beijing': 'Beijing Municipality', 'Tianjin': 'Tianjin Municipality', 'Hebei':'Hebei Province', 
# 'Shanxi':'Shanxi Province', 'InnerMongolia':'Inner Mongolia Autonomous Region',
# 'Liaoning':'Liaoning Province', 'Jilin':'Jilin Province', 'Heilongjiang':'Heilongjiang Province', 
# 'Shanghai':'Shanghai Municipality', 'Jiangsu':'Jiangsu Province',
# 'Zhejiang':'Zhejiang Province', 
# 'Anhui':'Anhui Province', 'Fujian':'Fujian Province', 'Jiangxi':'Jiangxi Province', 
# 'Shandong':'Shandong Province', 'Henan':'Henan Province', 'Hubei':'Hubei Province', 'Hunan':'Hunan Province', 
# 'Guangdong':'Guangdong Province', 'Guangxi':"Guangxi Zhuang Autonomous Region", 'Hainan':'Hainan Province', 'Chongqing':'Chongqing Municipality',
# 'Sichuan':'Sichuan Province', 'Guizhou':'Guizhou Province', 'Yunnan':'Yunnan Province', 'Shaanxi':'Shaanxi Province', 
# 'Gansu':'Gansu Province', 'Qinghai':'Qinghai Province', 'Ningxia':'Ningxia Hui Autonomous Region', 
# 'Xinjiang':'Xinjiang Uyghur Autonomous Region'


# Original from raw map json file:

# "Anhui"          "Beijing"        "Chongqing"      "Fujian"         "Gansu"          "Guangdong"      "Guangxi"        "Guizhou"        "Hainan"        
# "Hebei"          "Heilongjiang"   "Henan"          "Hubei"          "Hunan"          "Jiangsu"        "Jiangxi"        "Jilin"          "Liaoning"      
# "Nei Mongol"     "Ningxia Hui"    "Qinghai"        "Shaanxi"        "Shandong"       "Shanghai"       "Shanxi"         "Sichuan"        "Tianjin"       
# "Xinjiang Uygur" "Xizang"         "Yunnan"         "Zhejiang"    


