import csv

_12k = []
_800k = []
last10 = []
last60 = []

max_co2 = 200
with open("co2_mm_800k_yrs.csv", 'r') as csvfile:
	filereader = csv.reader(csvfile)
	next(filereader)
	for row in filereader:
		if float(row[0]) > -60:
			d = float(row[0]) + 2017.88
			yr = int(d);
			month = int((d % int(d))*12);
			print(month, yr)

'''
with open("co2_12k.csv", "r") as csvfile:
	filereader = csv.reader(csvfile)
	next(filereader)
	for row in filereader:
		year = float(row[0])
		if year < 8:
			_12k.append(row)

with open("co2_800k_yrs.csv", "r") as readfile:
	filereader = csv.reader(readfile, delimiter=",")
	next(filereader)
	for row in filereader:
		_800k.append(row)

with open("co2_mm_recent.csv", "r") as readfile:
	filereader = csv.reader(readfile, delimiter=",")
	next(filereader)
	for row in filereader:
		last10.append(row)

with open("co2_mm_years.csv", "r") as readfile:
	filereader = csv.reader(readfile, delimiter=",")
	next(filereader)
	for row in filereader:
		last60.append(row)

prev = [58, 312, 0]
with open("meta/co2_mm_data.csv", "r") as csvfile:
	filereader = csv.reader(csvfile)
	next(filereader)
	for row in filereader:
		year = round(float(row[0]) - 1950, 2)
		if (68 - year) < 10:
			if float(prev[1]) > float(row[2]):
				trend = 1
				if prev[2] != trend:
					last10.append([prev[0], prev[1], prev[2], trend])
				last10.append([year, row[2], row[3], trend])
			else:
				trend = -1
				if prev[2] != trend:
					last10.append([prev[0], prev[1], prev[2], trend])
				last10.append([year, row[2],row[3], trend])
			prev = [year, row[2], row[3], trend]

_60 = []
with open("meta/co2_mm_data.csv", "r") as csvfile:
	filereader = csv.reader(csvfile)
	next(filereader)
	for row in filereader:
		year = round(float(row[0]) - 1950, 2)
		_60.append([year, row[2], row[3]])

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


for i in range(len(_800k)):
	if i < len(last10):
		_800k[i].extend([last60[i][2], last10[i][3]])
	elif i > len(last10) and i < len(last60):
		_800k[i].extend([last60[i][2], ''])
	else:
		_800k[i].extend(['', ''])

with open("co2_mm_800k.csv", "w") as csvfile:
	filewriter = csv.writer(csvfile)
	filewriter.writerow(["year", "interpolated", "sigma_mean_CO2", "trend", "fluctuation"])
	filewriter.writerows(_800k)
	#filewriter.writerows(last10down)

'''

