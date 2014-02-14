function initBag(){
    /* require flask and ext 4.2 */
    
    Ext.Ajax.request({
        url: '/gStore_bagInfos',
        success: function(rep){
            var obj = JSON.parse(rep.responseText);
            //console.log(obj);
            function check(v, metaData, rec, rowIndex, colIndex, st){
                if(v===true){
                    return '<img width="24" height="24" src="static/images/tick.png" />';
                }
                else{
                    return '';
                }
            }
            
            bagColumnModel = [];
            // create and set generic param for all col
            for (var index = 0; index < obj.fields.length; index++){
                bagColumnModel.push({
                    text: obj.fields[index],
                    dataIndex: obj.fields[index],
                    width: 43,
                    editor: {
                        xtype: 'textfield'
                    }
                });
            }
             // set specific param for specific col
            bagColumnModel.forEach(function(v, i, a){
                if(v.text === "id"){
                    delete v.editor;
                    v.align = 'center';
                    v.toString = function(){return 'zzzz0'}; // use by sort function for array of object!
                    return;
                }
                if(v.text === "loc"){
                    v.width = 105;
                    v.toString = function(){return 'zzzz1'};
                    return;
                }
                if(v.text === "vendor"){
                    v.width = 125;
                    v.toString = function(){return 'zzzz2'};
                    return;
                }
                if(v.text === "minfo"){
                    v.flex = 1;
                    //v.shrinkWrap = 2; // not working
                    v.minWidth = 354;
                    delete v['width'];
                    v.toString = function(){return 'zzzz3'};
                    return;
                }
                v.renderer = check;
                //v.shrinkWrap = 1; // not working
                v.xtype = "checkcolumn";
                v.listeners = {
                    checkchange: {
                        fn: function(checkCol, rowIndex, checked){saveBagPlayerState(checkCol, rowIndex, checked);}
                    }
                };
                v.toString = function(){return v.text};
                delete v.editor;
            });
            bagColumnModel.sort();
            
            Ext.define('BagButton', {
                extend: 'Ext.Button',

                text: 'Bag infos',
                toggleGroup: 'bag',
                enableToggle: true,
                margin: '0 0 0 15px',
                toggleHandler: function(btn, pressed){
                    var grid = Ext.ComponentQuery.query('gridpanel')[0];
                    if(grid.bagWindow){
                        if (pressed){
                            // show window
                            grid.bagWindow.show();
                        }
                        else{
                            // hide window
                            grid.bagWindow.hide();
                        }
                    }
                    else{
                        grid.bagWindow = Ext.create('Ext.window.Window', {
                            title: 'Bags upgrade info',
                            layout: 'fit',
                            constrain: true,
                            btn: btn, // ref to this button to togglehim when window is reduce
                            autoShow: true,
                            closeAction: 'hide',
                            minimizable: true,
                            maximizable: true,
                            width: 800,
                            height: 250,
                            items: [bagGrid],
                            listeners: {
                                minimize: {
                                    fn: function(win){
                                        //
                                        win.btn.toggle(false, true); // toggle state, supressEvent
                                        win.hide();
                                    }
                                },
                                close: {
                                    fn: function(win){
                                        win.btn.toggle(false, true); // toggle state, supressEvent
                                    }
                                }
                            }
                        });
                    }
                }
            });
            
            //console.log(bagColumnModel);
            
            var bagStore = Ext.create('Ext.data.Store', {
                fields: obj.fields,
                data: obj.datas,
                sorters: ['id']
            });
            
            var bagGrid = Ext.create('Ext.grid.Panel', {
                //cls: 'g-trainer',
                store: bagStore,
                columns: bagColumnModel,
                selType: 'rowmodel',
                plugins: [
                    Ext.create('Ext.grid.plugin.RowEditing', {
                        clicksToEdit: 2
                    })
                ],
                listeners: {
                    afterrender: {
                        fn: function(grid){
                            //adjust col header width to fit content
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
                }
            });
            
            /* add validateedit event to the grid */
            bagGrid.on('validateedit', function(editor, context){
                updateBagsInfo(editor, context);
            });
            
            // add the button to the grid toolbar
            var trainerGrid = Ext.ComponentQuery.query('gridpanel')[0];
            trainerGrid.down('toolbar').insert(0,Ext.create('BagButton'));
        }
    });
}

function saveBagPlayerState(checkCol, rowIndex, checked){
    //console.log(checkCol, rowIndex, checked);
    var grid = checkCol.up('gridpanel'),
        store = grid.getStore(),
        rec = store.getAt(rowIndex);
    
    //console.log(checkCol.text, rowIndex, rec.get('id'), rec.get('profession'), rec.get('loc'), rec.get('trainer'), rec.get('minfo'), checked);
    
    Ext.Ajax.request({
        url: '/save_gStore_bagPlayersInfos',
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

function updateBagsInfo (editor, context){
    //console.log(context.record.get('id'), context.newValues, context.originalValues);
    var nLoc = context.newValues.loc,
        oLoc = context.originalValues.loc,
        nVendor = context.newValues.vendor,
        oVendor = context.originalValues.vendor,
        nMinfo = context.newValues.minfo,
        oMinfo = context.originalValues.minfo;
        
    var hasNewValue = false;
    
    if(nLoc !== oLoc)
        hasNewValue = true;
    if(nVendor !== oVendor)
        hasNewValue = true;
    if(nMinfo !== oMinfo)
        hasNewValue = true;
        
    if(hasNewValue){
        Ext.Ajax.request({
            url: '/update_gStore_bagsInfo',
            method: 'POST',
            params: {
                id: context.record.get('id'),
                loc: nLoc,
                vendor: nVendor,
                minfo: nMinfo
            },
            success: function(rep){
                //console.log(rep.responseText);
                context.record.commit(); // clear dirty
            }
        });
    }
}
