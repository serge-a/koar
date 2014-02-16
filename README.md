koar
====

Petit project personelle pour le suivi de choses faites dans un jeux (Kingdom Of Amalur: Reckoning).

Liste des trainers pour les Skills/Profession: nom profession, nom traineur, lieu, range du skill... 


Ajouter/suprimer les joueurs que vous voulez suivre.

Liste les emplacements d'upgrade pour les bags.


INSTALLATION:
==============================================

besoin installer: flask

liens vers flask app: http://flask.pocoo.org/docs/installation/
(info: http://flask.pocoo.org/docs/quickstart/)


besoin lib: (SDK) Sencha Ext Js 4.2.1

liens pour telecharger: http://www.sencha.com/products/extjs/download/ext-js-4.2.1/2281


    placer les fichiers (ou un symlink) dans static/LIBS/
        eg. static/LIBS/extjs/*.* 
            OU
            static/LIBS/ [symlink dans ce rep et nommer le extjs]

Vous etes pret


FEATURES:
==========================

TODO:

Gerer les joueurs:
    <ul>
        <li>Renommer</li>
    </ul>
    


DONE:

Gerer les infos trainers.
<ul>
    <li>Save / update des infos de traineurs.</li>
    <li>Save / update du status du joueur pour chaque skill.</li>
</ul>

Gerer les joueurs:
<ul>
    <li>Ajouter</li>
    <li>Supprimer</li>
</ul>

Liste emplacements des bags upgrade (extension de place inventaire)
<ul>
    <li>Save / update info des vendor bags</li>
    <li>Save / update du status du joueur (s) pour chaque bags</li>
</ul>
