import csv, json

position = []

with open("position.csv", "r") as infile:
	reader = csv.reader(infile, delimiter=",")
	next(reader)
	for row in reader:
		position.append({"x": float(row[0]), "y":float(row[1])})

for row in position:
	print (row)

with open("position.json", "w") as outfile:
	json.dump(position, outfile)