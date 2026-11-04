"""Post-scrape manual corrections (run after scrape.py). Only renames/dedupes; never adds data."""
import json,shutil
R={"Egypt-born Kareem Amin’s Clay":"Clay","Outmarket in California AI":"Outmarket"}
DROP={("Crusoe",3000000000),("Northwood",375000000)}  # same raise as confirmed $3.9B Series F
r=json.load(open('data/rounds.json'))
SECTOR={"DeepSeek":"AI/ML","Mistral AI":"AI/ML"}
out=[]
for x in r:
  x['company']=R.get(x['company'],x['company'])
  x["sector"]=SECTOR.get(x["company"],x["sector"])
  if (x['company'],x['amount_usd']) in DROP: continue
  out.append(x)
json.dump(out,open('data/rounds.json','w'),indent=1)
shutil.copy('data/rounds.json','site/data/rounds.json')
print(len(out))
