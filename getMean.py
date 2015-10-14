import requests, json, numpy as np

#Get section data
r = requests.get('https://api.clever.com/v1.1/sections?limit=1000000', headers={'Authorization':'Bearer DEMO_TOKEN'})

# Save returned JSON in a file
data = json.loads(r.text)

#index into the data component
data_content = data['data']

section_list = []
for key, val in enumerate(data_content):
	section_size = len(val['data']['students'])
	section_list.append(section_size)

statistics = np.array(section_list)
print statistics.mean()

	


