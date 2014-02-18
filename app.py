# -*- coding: utf-8 -*-
import os, sys, logging
#logging.basicConfig(stream=sys.stderr)

from flask import Flask, request, render_template, jsonify, url_for
import json, copy
#import logging, sys
#logging.basicConfig(stream=sys.stderr)

app = Flask(__name__)

basePath = os.path.dirname(os.path.realpath(__file__))

@app.route('/')
@app.route('/index')
@app.route('/index.html')
def index():
    return render_template('index.html')
    
@app.route('/gStore_SkillsTrained', methods=['GET', 'POST'])
def gStore_SkillsTrained():
    
    fpTrainersData = open(os.path.join(basePath, 'static/trainersData.json'))
    jsonTrainersInfos = json.load(fpTrainersData)
    fpTrainersData.close()
    
    try:
        fpPlayersData = open(os.path.join(basePath, 'static/playersData.json'))
        # need a file not empty and with valid json
        jsonPlayersInfos = json.load(fpPlayersData)
        fpPlayersData.close()
    except ValueError as e:
        # case json error, empty file?
        if "No JSON object could be decoded" in e:
        #gen base data
            base = {}
            base['items'] = {}
            for id in range(0,38):
                if id < 10:
                    base['items']["0" + str(id)] = {"playerName": False}
                else:
                    base['items'][str(id)] = {"playerName": False}
            
            jsonPlayersInfos = base
    
    
    #combine the 2 data
    
    store = copy.deepcopy(jsonTrainersInfos)
    for i in jsonPlayersInfos['items']:
        for j in jsonPlayersInfos['items'][i]:
            store['items'][i][j] = jsonPlayersInfos['items'][i][j]
    
    for key in store['items']:
        store['items'][key]['id'] = key
    
    datas = store['items'].values() # transform in a list
    
    fields=[]
    for key in datas[0]:
        fields.append(key)
        #print key
    
    d={}
    d["fields"] = fields
    d["datas"] = datas
    return json.dumps(d)
    
@app.route('/gStore_bagInfos')
def gStore_bagInfos():
    fpVendorsData = open(os.path.join(basePath, 'static/bagVendorsData.json'))
    jsonVendorsInfos = json.load(fpVendorsData)
    fpVendorsData.close()
    
    fpBagPlayersData = open(os.path.join(basePath, 'static/bagPlayersData.json'))
    jsonBagPlayersInfos = json.load(fpBagPlayersData)
    fpBagPlayersData.close()
    
    #combine the 2 data
    
    store = copy.deepcopy(jsonVendorsInfos)
    for i in jsonBagPlayersInfos['items']:
        for j in jsonBagPlayersInfos['items'][i]:
            store['items'][i][j] = jsonBagPlayersInfos['items'][i][j]
    
    for key in store['items']:
        store['items'][key]['id'] = key
    
    datas = store['items'].values()
    fields=[]
    for key in datas[0]:
        fields.append(key)
        #print key
    
    d={}
    d["fields"] = fields
    d["datas"] = datas
    return json.dumps(d)

# save main grid (trainers infos)
@app.route('/save_gStore_SkillsTrained', methods=['POST'])
def save_gStore_SkillsTrained():
    name = request.form['name']
    id = request.form['id']
    val = request.form['val']
    if val == "true":
        val = True
    else:
        val = False
    
    fp = open(os.path.join(basePath, 'static/playersData.json'))
    fp.seek(0,0)
    #print fp.tell()
    data = json.load(fp)
    fp.close()
    data['items'][id][name] = val
    
    fp = open(os.path.join(basePath, 'static/playersData.json'), 'w')
    fp.write(json.dumps(data,indent=4,sort_keys=True))
    fp.close()
    return "Saved"
    
@app.route('/update_gStore_trainerInfo', methods=['POST'])
def update_gStore_trainerInfo():
    fpTrainersData = open(os.path.join(basePath, 'static/trainersData.json'))
    jsonTrainersInfos = json.load(fpTrainersData)
    fpTrainersData.close()
    
    #print request.form
    id = request.form['id']
    loc = request.form['loc']
    profession = request.form['profession']
    trainer = request.form['trainer']
    minfo = request.form['minfo']
    
    jsonTrainersInfos['items'][id]['loc'] = loc
    jsonTrainersInfos['items'][id]['profession'] = profession
    jsonTrainersInfos['items'][id]['trainer'] = trainer
    jsonTrainersInfos['items'][id]['minfo'] = minfo
    
    fp = open(os.path.join(basePath, 'static/trainersData.json'), 'w')
    fp.write(json.dumps(jsonTrainersInfos,indent=4,sort_keys=True))
    fp.close()
    return "update"
    
# save bags grid
@app.route('/save_gStore_bagPlayersInfos', methods=['POST'])
def save_gStore_bagPlayersInfos():
    name = request.form['name']
    id = request.form['id']
    val = request.form['val']
    if val == "true":
        val = True
    else:
        val = False
    
    fp = open(os.path.join(basePath, 'static/bagPlayersData.json'))
    fp.seek(0,0)
    data = json.load(fp)
    fp.close()
    data['items'][id][name] = val
    
    fp = open(os.path.join(basePath, 'static/bagPlayersData.json'), 'w')
    fp.write(json.dumps(data,indent=4,sort_keys=True))
    fp.close()
    return "Saved"
    
@app.route('/update_gStore_bagsInfo', methods=['POST'])
def update_gStore_bagsInfo():
    fpBagVendorsData = open(os.path.join(basePath, 'static/bagVendorsData.json'))
    jsonBagVendorsInfos = json.load(fpBagVendorsData)
    fpBagVendorsData.close()
    
    #print request.form
    id = request.form['id']
    loc = request.form['loc']
    vendor = request.form['vendor']
    minfo = request.form['minfo']
    
    jsonBagVendorsInfos['items'][id]['loc'] = loc
    jsonBagVendorsInfos['items'][id]['vendor'] = vendor
    jsonBagVendorsInfos['items'][id]['minfo'] = minfo
    
    fp = open(os.path.join(basePath, 'static/bagVendorsData.json'), 'w')
    fp.write(json.dumps(jsonBagVendorsInfos,indent=4,sort_keys=True))
    fp.close()
    return "update"
    
# need to recompute this: must check at the same time playerData and bagPlayerData, in case of interuption, 
#player will be potentially add in one file but not in the second
@app.route('/addPlayer', methods=['POST'])
def addPlayer():
    playerName = request.form['name']
    # veux juste des nom avec premier lettre capitalized
    playerName = playerName.capitalize()
    
    #TODO:
    # ajouter verification des nom, par exemple: 
    #minimun vital 
    invalidNames = ["__defineGetter__", "__defineSetter__", "__lookupGetter__", "__lookupSetter__", "constructor", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "propertyIsEnumerable", "toLocaleString", "toString", "valueOf"]
    if playerName in invalidNames:
        d = {}
        d["error"] = "Le nom choisit est invalid. Choisisez-vous en un autre."
        d["invalidNames"] = invalidNames
        return json.dumps(d)
        
    if playerName == "":
        d = {}
        d["error"] = "Le nom choisit est invalid. Choisisez-vous en un autre."
        d["invalidNames"] = 'EmptyString'
        return json.dumps(d)
        
    # skill file
    # verify if player name already exist
    fp = open(os.path.join(basePath, 'static/playersData.json'))
    datas = json.load(fp)
    fp.close()
    
    # datas structure datas['items']['id']['playerName']
    if playerName in datas['items']['0']:
        return '{"error": "Ce nom de joueur est déjà utilisé."}'
    
    #save it to the file with default data [false]
    for k in datas['items']:
        datas['items'][k][playerName] = False
        
    fp = open(os.path.join(basePath, 'static/playersData.json'), 'w')
    fp.write(json.dumps(datas,indent=4))
    fp.close()
    
    # bag file
    # verify if player name already exist
    fp = open(os.path.join(basePath, 'static/bagPlayersData.json'))
    datas = json.load(fp)
    fp.close()
    
    # datas structure datas['items']['id']['playerName']
    if playerName in datas['items']['0']:
        return '{"error": "Ce nom de joueur est déjà utilisé."}'
    
    #save it to the file with default data [false]
    for k in datas['items']:
        datas['items'][k][playerName] = False
        
    fp = open(os.path.join(basePath, 'static/bagPlayersData.json'), 'w')
    fp.write(json.dumps(datas,indent=4))
    fp.close()
    
    return '{"success": "Le joueur: ' + playerName + u' à été ajouté."}'
            
    
# need to recompute this: must check at the same time playerData and bagPlayerData, in case of interuption, 
#player will be potentially del in one file but not in the second
@app.route('/delPlayer', methods=['POST'])
def delPlayer():
    playerName = request.form['name']
    # veux juste des nom avec premier lettre capitalized
    playerName = playerName.capitalize()
    
    # empty
    if playerName == "":
        d = {}
        d["error"] = "Le nom choisit est invalid. Choisisez-vous en un autre."
        d["msg"] = 'Un string vide est invalide!'
        return json.dumps(d)
    
    #read trained skill
    fp = open(os.path.join(basePath, 'static/playersData.json'), 'r')
    datas = json.load(fp)
    fp.close()
    
    # exist?
    if playerName in datas['items']["0"]:
        for k in datas['items']:
            del datas['items'][k][playerName]
    else:
        d = {}
        d["error"] = "Ce joueur n'existe plus."
        d["msg"] = 'Introuvable.'
        return json.dumps(d)
    
    # write
    fp = open(os.path.join(basePath, 'static/playersData.json'), 'w')
    fp.write(json.dumps(datas,indent=4))
    fp.close()
    
    #read bag upgrade
    fp = open(os.path.join(basePath, 'static/bagPlayersData.json'), 'r')
    datas = json.load(fp)
    fp.close()
    
    # exist?
    if playerName in datas['items']["0"]:
        for k in datas['items']:
            del datas['items'][k][playerName]
    else:
        d = {}
        d["error"] = "Ce joueur n'existe plus."
        d["msg"] = 'Introuvable.'
        return json.dumps(d)
    
    # write
    fp = open(os.path.join(basePath, 'static/bagPlayersData.json'), 'w')
    fp.write(json.dumps(datas,indent=4))
    fp.close()
    
    return '{"success": "Le joueur: ' + playerName + u" à été éffacé." + '"}'
    
    
if __name__ == '__main__':
    app.debug = True
    app.run()
