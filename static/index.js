function init(){
    /* require flask and ext 4.2 */
    Ext.define('MenuButton', {
        extend: 'Ext.button.Button',
        alias: 'widget.menubutton',
        // pourrait ajouter mouseout et fade animation
        listeners: {
            'mouseover': {
                fn: function(btn, e){
                    btn.showMenu({btn: btn, e: e});
                }
            }
        }
    });
    
    /*sm = Ext.define('SkillsModel', {
        proxy: {
            type: 'ajax',
            url: '/gStore_SkillsTrained?fields=1',
            reader: {
                type: 'json',
                root: 'fields'
            }
        }
    });*/
    
    Ext.Ajax.request({
        url: '/gStore_SkillsTrained',
        success: function(rep){
            var obj = JSON.parse(rep.responseText);
            //console.log(obj);
            
            var columnModel = genColumnModel(obj.fields); // only require fields to be generated
            
            // toolbar filter object
            var fields = [];
            for(var i = 0; i < obj.fields.length; i++){
                if(obj.fields[i] !== 'id' && obj.fields[i] !== 'range')
                    fields.push(obj.fields[i]);
            }
            
            var bar = Ext.create('Ext.toolbar.Toolbar', {
                dock: 'bottom',
                cls: 'myToolbarGray',
                height: 40,
                items: [
                    {
                        xtype: 'menubutton', //'button',
                        text: 'Gestion joueurs',
                        margin: "0 0 0 10px",
                        menu: {
                            plain: true,
                            items: [{
                                text: "Ajouter un joueur",
                                plain: true,
                                style: 'text-align: center;',
                                handler: function(btn){
                                    Ext.Msg.show({
                                        title: 'Ajouter un joueur',
                                        msg: 'Entrez un nom:',
                                        buttons: Ext.Msg.OKCANCEL,
                                        icon: Ext.Msg.QUESTION,
                                        prompt: true,
                                        fn: function(btnValue, textValue){
                                            if(btnValue == "cancel")
                                                return;
                                            else
                                                addPlayer(textValue);
                                        }
                                    });
                                }
                            }]
                        }
                    },
                    '->',
                    {xtype: 'label', text:"SKILLS TRAINERS INFOS", cls: 'title'},
                    '->',
                    
                    {
                        xtype: 'combobox',
                        emptyText: 'Choose a column',
                        name: 'colFilter',
                        store: fields,
                        forceSelection: true,
                        queryMode: 'local',
                        displayField: 'val',
                        valueField: 'val'
                    },
                    {
                        xtype: 'textfield',
                        emptyText: 'value to be filtered',
                        name: 'rowFilter',
                    },
                    {
                        xtype: 'button',
                        text: 'Filtrer',
                        handler: function(btn){
                            var t1 = btn.up('toolbar').down('[name=colFilter]');
                            var t1v = t1.getValue();
                            console.log(t1, t1v);
                            if(t1v == null){
                                return
                            }
                            var t2 = btn.up('toolbar').down('[name=rowFilter]');
                            var t2v = t2.getValue();
                            console.log(t2, t2v);
                            var st = btn.up('gridpanel').getStore();
                            // first cler precedent filtering
                            st.clearFilter();
                            st.filter(t1v,t2v);
                        }
                    },
                    {
                        xtype: 'button',
                        text: 'clear filtering',
                        handler: function(btn){
                            btn.up('gridpanel').getStore().clearFilter();
                            btn.up('toolbar').down('[name=colFilter]').clearValue();
                            btn.up('toolbar').down('[name=rowFilter]').reset();
                        },
                        margin: '0 15px 0 0'
                    }
                ]
            });
            
            //console.log(columnModel);
            Ext.define('Unmodel', {
                extend: 'Ext.data.Model',
                fields: obj.fields
            });
            
            var store = Ext.create('Ext.data.Store', {
                //fields: obj.fields,
                model: 'Unmodel',
                data: obj.datas,
                groupField: 'range',
                sorters: ['loc']/*,
                proxy: {
                    type: 'ajax',
                    url: '/users.json',
                    reader: {
                        type: 'json',
                        root: 'users'
                    }
                }*/
            });
            
            var grid = Ext.create('Ext.grid.Panel', {
                cls: 'g-trainer',
                tbar: bar,
                store: store,
                columns: columnModel,
                features: [{ftype:'grouping'}],
                selType: 'rowmodel',
                plugins: [
                    Ext.create('Ext.grid.plugin.RowEditing', {
                        clicksToEdit: 2
                    })
                ],
                listeners: {
                    afterrender: {
                        fn: function(grid){
                            //adjust col header width to fit content for 3 first players
                            var cols = grid.columns;
                            var len = cols.length;
                            setTimeout(function(){
                                for(var i = 0; i < len; i++){
                                    if(cols[i].textEl.getWidth() + 12 > cols[i].getWidth())// 12 => padding
                                        cols[i].setWidth(cols[i].textEl.getWidth() + 20);// 20 => padding + place for triangle sort icon
                                }
                                grid.update();
                            }, 0);
                        }
                    }
                }/*,
                style: 'border: 10px solid gray; border-radius: 25px;'*/
            });
            
            Ext.create('Ext.container.Viewport', {
                layout: 'fit',
                items: [grid]
            });
            
            /* add validateedit event to the grid */
            grid.on('validateedit', function(editor, context){
                updateTrainerInfos(editor, context);
            });
            
            // add the bag button to the grid toolbar
            initBag();
        }
    });
}

function check(v, metaData, rec, rowIndex, colIndex, st){
    if(v===true){
        return '<img width="24" height="24" src="static/images/tick.png" />';
    }
    else{
        return '';
    }
}

function genColumnModel(fields){
    var columnModel = [];
    // create and set generic param for all col
    for (var index = 0; index < fields.length; index++){
        columnModel.push({
            text: fields[index],
            dataIndex: fields[index],
            width: 43,
            editor: {
                xtype: 'textfield'
            }
        });
    }
     // set specific param for specific col
    columnModel.forEach(function(v, i, a){
        if(v.text === "id"){
            v.hidden = true;
            delete v.editor;
            v.toString = function(){return 'zzzz0';}; // use by sort function for array of object!
            return;
        }
        if(v.text === "range"){
            v.width = 50;
            v.hidden = true;
            v.toString = function(){return 'zzzz1';};
            return;
        }
        if(v.text === "profession"){
            v.width = 81;
            v.filterable = true;
            v.toString = function(){return 'zzzz2';};
            return;
        }
        if(v.text === "loc"){
            v.width = 105;
            v.toString = function(){return 'zzzz3';};
            return;
        }
        if(v.text === "trainer"){
            v.width = 125;
            v.toString = function(){return 'zzzz4';};
            return;
        }
        if(v.text === "minfo"){
            v.flex = 1;
            delete v['width'];
            v.toString = function(){return 'zzzz5';}; // position it last
            return;
        }
        v.renderer = check;
        v.xtype = "checkcolumn";
        v.listeners = {
            checkchange: {
                fn: function(checkCol, rowIndex, checked){savePlayerState(checkCol, rowIndex, checked);}
            }
        };
        v.toString = function(){return v.text};
        delete v.editor;
    });
    columnModel.sort();
    return columnModel;
}

function savePlayerState(checkCol, rowIndex, checked){
    //console.log(checkCol, rowIndex, checked);
    var grid = checkCol.up('gridpanel'),
        store = grid.getStore(),
        rec = store.getAt(rowIndex);
    
    // eventually to remove, when Sencha fix this bug, not fix in 4.2... an earlier
    if(rowIndex === -1){
        Ext.Msg.show({
             title:'Groupping Error',
             msg: 'Can\'t save the new State :(<br><br>Uncollapse all group and do the set again the state for the Player.<br><br>BUG from ext grid grouping, can\'t return good index when an group is collapse!!!<br><br>Wait for a fix from Sencha!\n',
             buttons: Ext.Msg.OK,
             icon: Ext.Msg.WARNING
        });
        return;
    }
    
    //console.log(checkCol.text, rowIndex, rec.get('id'), rec.get('profession'), rec.get('loc'), rec.get('trainer'), rec.get('minfo'), checked);
    
    Ext.Ajax.request({
        url: '/save_gStore_SkillsTrained',
        method: 'POST',
        params: {
            name: checkCol.text,
            id: rec.get('id'),
            val: checked
        },
        success: function(rep){
            //console.log(rep.responseText);
            rec.commit();
        }
    });
};

function updateTrainerInfos (editor, context){
    //console.log(context.record.get('id'), context.newValues, context.originalValues);
    var nLoc = context.newValues.loc,
        oLoc = context.originalValues.loc,
        nProfession = context.newValues.profession,
        oProfession = context.originalValues.profession,
        nTrainer = context.newValues.trainer,
        oTrainer = context.originalValues.trainer,
        nMinfo = context.newValues.minfo,
        oMinfo = context.originalValues.minfo;
        
    var hasNewValue = false;
    
    if(nLoc !== oLoc)
        hasNewValue = true;
    if(nProfession !== oProfession)
        hasNewValue = true;
    if(nTrainer !== oTrainer)
        hasNewValue = true;
    if(nMinfo !== oMinfo)
        hasNewValue = true;
        
    if(hasNewValue){
        Ext.Ajax.request({
            url: '/update_gStore_trainerInfo',
            method: 'POST',
            params: {
                id: context.record.get('id'),
                loc: nLoc,
                profession: nProfession,
                trainer: nTrainer,
                minfo: nMinfo
            },
            success: function(rep){
                //console.log(rep.responseText);
                context.record.commit(); // clear dirty
            }
        });
    }
}

function addPlayer(name){
    // un minimun de verif
    var invalidNames = ["__defineGetter__", "__defineSetter__", "__lookupGetter__", "__lookupSetter__", "constructor", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "propertyIsEnumerable", "toLocaleString", "toString", "valueOf"];
    
    var valid = true;
    if (name in invalidNames){
        valid = false;
        Ext.Msg.show({
            title: 'Nom invalid',
            msg: [
                'Les noms suivants ne sont pas accepté par mesure de sécurité et/ou compatibilité:',
                "<br><br>",
                invalidNames.join(", "),
                "<br><br>",
                "Voulez-vous entrez un autre nom?"
            ].join(''),
            buttons: Ext.Msg.YESNO,
            icon: Ext.MessageBox.ERROR, //Ext.MessageBox.WARNING, // 
            fn: function(val){
                if(val == "cancel" || val == "no"){
                    return;
                }
                else{
                    Ext.Msg.show({
                        title: 'Ajouter un joueur',
                        msg: 'Entrez un nouveau nom:',
                        buttons: Ext.Msg.OKCANCEL,
                        icon: Ext.Msg.QUESTION,
                        prompt: true,
                        fn: function(btnValue, textValue){
                            if(btnValue == "cancel")
                                return;
                            else
                                addPlayer(textValue);
                        }
                    });
                }
            }
        });
    }
    
    if(valid){
        // call the server and save the new name.
        console.log(name);
        Ext.Ajax.request({
            url: "/addPlayer",
            params:{
                "name": name
            },
            success: function(rep){
                var r = JSON.parse(rep.responseText);
                console.log(r);
            }
        });
    }
    
}

var q = function(sel){return Ext.ComponentQuery.query(sel);};