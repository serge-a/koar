function genBagStore(f, d){
    return Ext.create('Ext.data.Store', {
        fields: f,
        data: d,
        sorters: ['id']
    });
}

function genBagCols(fields){
    var cols = [];
    // create and set generic param for all col
    for (var index = 0; index < fields.length; index++){
        cols.push({
            text: fields[index],
            dataIndex: fields[index],
            width: 43,
            editor: {
                xtype: 'textfield'
            }
        });
    }
     // set specific param for specific col
    cols.forEach(function(v, i, a){
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
    return cols
}

function genBagsGrid(st, cols){
    return Ext.create('Ext.grid.Panel', {
        //cls: 'g-trainer',
        store: st,
        columns: cols,
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
            },
            validateedit: {
                fn : updateBagsInfo
            }
        }
    });
}

Ext.define('BagWindow', {
    extend: 'Ext.window.Window',
    alias: 'widget.bagwin',
    title: 'Bags upgrade info',
    layout: 'fit',
    constrain: true,
    closeAction: 'hide',
    minimizable: true,
    maximizable: true,
    resizable: false,
    width: 800,
    height: 250,
    listeners: {
        minimize: {
            fn: function(win){
                win.btn.toggle(false, true); // toggle state, supressEvent
                win.hide();
            }
        },
        close: {
            fn: function(win){
                win.btn.toggle(false, true); // toggle state, supressEvent
            }
        }
    },
    addGrid: function(){
        var win = this;
        Ext.Ajax.request({
            url: '/gStore_bagInfos',
            success: function(rep){
                var obj = JSON.parse(rep.responseText);
                //console.log(obj);
                
                bagColumnModel = genBagCols(obj.fields);
                bagColumnModel.sort();
                //console.log(bagColumnModel);
                
                var bagStore = genBagStore(obj.fields, obj.datas);
                var bagGrid = genBagsGrid(bagStore, bagColumnModel);
                win.add(bagGrid);
            }
        });
    }
});

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
