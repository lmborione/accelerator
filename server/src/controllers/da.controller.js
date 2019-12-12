const svcMng = require('../services/manager.service').ServiceManager;
const daModelsModel = require('../models/daModels.model');
const axios = require('axios');

const librarypath = process.env.LIBRARY_PATH;

var objectsModel = require('../models/objects.model');
var projectFamilies = require('../models/project_families.model');

class DesignAutomationController {
    constructor() {
        this.launchDA.bind(this);
    }

    launchDA(req, res, next) {
        const revitService = svcMng.getService('RevitService');

        if (req.params.projectId) {
            const projectId = req.params.projectId
            // Recupérer la liste des objets depuis la DB (object_id, pk, family, type, paramDicts, alignment_id, revit_id)
            const projObjects = getObjectsOfProject(projectId);

            // Récupérer la liste des familles chargés dans le projet
            const projFamilies = getFamiliesOfProject(projectId);
            // Déterminer les familles à ajouter
            const familyToAdd = projObjects.reduce((acc, curr) => {
                if (projFamilies.findIndex(e => e.path === curr.famName) < 0 && acc.findIndex(e => e.path === curr.famName) < 0) {
                    acc.push({
                        path: curr.famName
                    })
                }
                return acc;
            }, []);

            // zipper les familles
            const familiesPath = familyToAdd.map((item) => {
                return `${librarypath}/${item.path}`;
            });
            const zipPath = revitService.createFamilyZip(familiesPath);

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

}

function getObjectsOfProject(projectId) {
    const projObjects = objectsModel.getObjectsOfProject(projectId);
    if (projObjects && projObjects.length > 0) {
        return projObjects
    } else {
        throw new Error('Project not found or project has no objects')
    }

}

function getFamiliesOfProject(projectId) {
    const familyList = projectFamilies.getFamilies(projectId);
    if (familyList) {
        return familyList;
    } else {
        throw new Error('Project not found');
    }

}

module.exports = {
    DesignAutomationController
};