import csv

_800k = []
'''
with open("co2_12k.csv", "r") as csvfile:
	filereader = csv.reader(csvfile)
	next(filereader)
	for row in filereader:
		year = float(row[0])
		if year < 8:
			_12k.append(row)


with open("meta/co2_800k.csv", "r", encoding='utf-8') as readfile:
	filereader = csv.reader(readfile, delimiter=",")
	next(filereader)
	for row in filereader:
		year = float(row[0])
		if year < 8:
			_800k.append(row)
'''

with open("co2_mm_800k.csv", "r") as csvfile:
	filereader = csv.reader(csvfile)
	next(filereader)
	for row in filereader:
		year = round(float(row[0]) - 67.88, 2)
		print(year)
		_800k.append([year, row[1], row[2], row[3], row[4]])
		

'''
_60 = []
with open("meta/co2_mm_data.csv", "r") as csvfile:
	filereader = csv.reader(csvfile)
	next(filereader)
	for row in filereader:
		year = round(float(row[0]) - 1950, 2)
		_60.append([year, row[2], row[3]])
'''


'''
with open("co2_12k_yrs.csv", "w") as csvfile:
	filewriter = csv.writer(csvfile)
	filewriter.writerow(["year", "interpolated", "sigma_mean_CO2"])
	filewriter.writerows(_12k)
	filewriter.writerows(last60)


with open("co2_800k_yrs.csv", "w") as csvfile:
	filewriter = csv.writer(csvfile)
	filewriter.writerow(["year", "interpolated", "sigma_mean_CO2"])
	filewriter.writerows(_800k)
	filewriter.writerows(last60)

with open("co2_mm_years.csv", "w") as csvfile:
	filewriter = csv.writer(csvfile)
	filewriter.writerow(["year", "interpolated", "trend"])
	filewriter.writerows(_60)
'''

with open("co2_mm_800k.csv", "w") as csvfile:
	filewriter = csv.writer(csvfile)
	filewriter.writerow(["year", "interpolated", "trend", "fluctuation"])
	filewriter.writerows(_800k)



