const svcMng = require('../services/manager.service').ServiceManager;
const daModelsModel = require('../models/daModels.model');
const axios = require('axios');

const librarypath = process.env.LIBRARY_PATH;

var objectsModel = require('../models/objects.model');
var projectFamilies = require('../models/project_families.model');

class DesignAutomationController {
    constructor() { }

    launchDA(req, res, next) {

        if (req.params.projectId) {
            const projectId = req.params.projectId
            // Recupérer la liste des objets depuis la DB (object_id, pk, family, type, paramDicts, alignment_id, revit_id)
            const projObjects = this.getObjectsOfProject(projectId);
            console.log('projObjects');
            console.log(projObjects);

            // Récupérer la liste des familles chargés dans le projet
            const projFamilies = this.getFamiliesOfProject(projectId);
            // Déterminer les familles à ajouter

            const famOfObjects = projObjects.reduce((acc, curr) => {
                if (!projFamilies.includes(curr.famName)) {
                    acc.push(curr.famName)
                }
            }, []);

            console.log('famOfObjects');
            console.log(famOfObjects);


            // zipper les familles

        }
        else {
            throw new Error('ProjectId not found')
        }





        // Récupérer les coordonnées de chaque PK + angle + rotaxis

        // Récupérer les status des familles



        // Créer le params.json

        // Verifier si la bucket et la da_bucket existe sinon les créer 
        // et ajouter le template dans da_bucket

        // Mettre le json et le zip dans la da_bucket

        // Convertir les url

        // Post work item

        // Récupérer le result.rvt et le télécharger sur le serveur
        // puis remplacer le fichier input.rvt sur la da_bucket
        // stoker le fichier dans la bucket (avec renommage)

        // Récupérer le output.json et mettre à jour la DB objects

        // Convertir le fichier Revit de la bucket projet en SVF

        // Return urn
    }

    getObjectsOfProject(projectId) {
        const projObjects = await objectsModel.getObjectsOfProject(projectId);
        if (projObjects && projObjects.length > 0) {
            return projObjects
        } else {
            throw new Error('Project not found or project has no objects')
        }

    }

    getFamiliesOfProject(projectId) {
        const familyList = await projectFamilies.getFamilies(projectId);
        if (familyList) {
            return familyList;
        } else {
            throw new Error('Project not found');
        }

    }
}

module.exports = {
    DesignAutomationController
};