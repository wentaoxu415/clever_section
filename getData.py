import requests, json, numpy as np
#Get section data
r = requests.get('https://api.clever.com/v1.1/sections?limit=1000000', headers={'Authorization':'Bearer DEMO_TOKEN'})

# Save returned JSON in a file
data = json.loads(r.text)
with open('data/sectionData.json', 'w') as outfile:
	json.dump(data, outfile, indent=4)
	


