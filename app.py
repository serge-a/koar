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
    
    #return os.path.join(basePath, 'static/playersData.json')
    return render_template('index.html')
    
@app.route('/gStore_SkillsTrained', methods=['GET', 'POST'])
def gStore_SkillsTrained():
    
    fpTrainersData = open(os.path.join(basePath, 'static/trainersData.json'))
    jsonTrainersInfos = json.load(fpTrainersData)
    fpTrainersData.close()
    
    fpPlayersData = open(os.path.join(basePath, 'static/playersData.json'))
    jsonPlayersInfos = json.load(fpPlayersData)
    fpPlayersData.close()
    
    #combine the 2 data
    
    store = copy.deepcopy(jsonTrainersInfos)
    for i in jsonPlayersInfos['items']:
        for j in jsonPlayersInfos['items'][i]:
            store['items'][i][j] = jsonPlayersInfos['items'][i][j]
    
    for key in store['items']:
        store['items'][key]['id'] = key
    
    datas = store['items'].values() # transform in a list
    
    if 'store' in request.args or 'store' in request.form: # get or post
        return json.dumps(datas)
    fields=[]
    for key in datas[0]:
        fields.append(key)
        #print key
    if 'fields' in request.args or 'fields' in request.form: # get or post
        d={}
        d['metaData'] = {}
        d['metaData']['fields'] = fields
        return json.dumps(d)
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
    for i in jsonVendorsInfos['items']:
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
    print fp.tell()
    data = json.load(fp)
    fp.close()
    data['items'][id][name] = val
    print data['items']["0"][name]
    print data['items']["1"][name]
    #print val, data['items'][id][name]
    
    fp = open(os.path.join(basePath, 'static/playersData.json'), 'w')
    fp.write(json.dumps(data,indent=4))
    fp.close()
    return "Saved"
    
@app.route('/update_gStore_trainerInfo', methods=['POST'])
def update_gStore_trainerInfo():
    fpTrainersData = open(os.path.join(basePath, 'static/trainersData.json'))
    jsonTrainersInfos = json.load(fpTrainersData)
    fpTrainersData.close()
    
    print request.form
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
    fp.write(json.dumps(jsonTrainersInfos,indent=4))
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
    print data['items']["0"][name]
    print data['items']["1"][name]
    #print val, data['items'][id][name]
    
    fp = open(os.path.join(basePath, 'static/bagPlayersData.json'), 'w')
    fp.write(json.dumps(data,indent=4))
    fp.close()
    return "Saved"
    
@app.route('/update_gStore_bagsInfo', methods=['POST'])
def update_gStore_bagsInfo():
    fpBagVendorsData = open(os.path.join(basePath, 'static/bagVendorsData.json'))
    jsonBagVendorsInfos = json.load(fpBagVendorsData)
    fpBagVendorsData.close()
    
    print request.form
    id = request.form['id']
    loc = request.form['loc']
    vendor = request.form['vendor']
    minfo = request.form['minfo']
    
    jsonBagVendorsInfos['items'][id]['loc'] = loc
    jsonBagVendorsInfos['items'][id]['vendor'] = vendor
    jsonBagVendorsInfos['items'][id]['minfo'] = minfo
    
    fp = open(os.path.join(basePath, 'static/bagVendorsData.json'), 'w')
    fp.write(json.dumps(jsonBagVendorsInfos,indent=4))
    fp.close()
    return "update"
    
    
@app.route('/addPlayer', methods=['POST'])
def addPlayer():
    playerName = request.form['name']
    
    #TODO:
    # ajouter verification des nom, par exemple: 
    #minimun vital 
    invalidNames = ["__defineGetter__", "__defineSetter__", "__lookupGetter__", "__lookupSetter__", "constructor", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "propertyIsEnumerable", "toLocaleString", "toString", "valueOf"]
    if playerName in invalidNames:
        d = {}
        d["error"] = "Le nom choisit est invalid. Choisisez-vous en un autre."
        d["invalidNames"] = invalidNames
        return json.dumps(d)
    # verify if player name already exist
    fpPlayerDatas = open(os.path.join(basePath, 'static/playersData.json'))
    datas = json.load(fpPlayerDatas)
    fpPlayerDatas.close()
    
    # datas structure datas['items']['id']['playerName']
    if playerName in datas['items']['0']:
        return '{"error": "Ce nom de joueur est déjà utilisé."}'
    else:
        #save it to the file with default data [false]
        for k in datas['items']:
            datas['items'][k][playerName] = False
            
        fp = open(os.path.join(basePath, 'static/playersData.json'), 'w')
        fp.write(json.dumps(datas,indent=4))
        fp.close()
        
        return '{"success": "Player name: ' + playerName + ' has been added"}'
            
    
if __name__ == '__main__':
    app.debug = True
    app.run()