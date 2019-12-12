using System;
using System.IO;
using System.Collections.Generic;
using System.Linq;
using System.Diagnostics;

using Newtonsoft.Json;

using Autodesk.Revit.ApplicationServices;
using Autodesk.Revit.DB;

using DesignAutomationFramework;

namespace ObjectsInsertion
{

    [Autodesk.Revit.Attributes.Regeneration(Autodesk.Revit.Attributes.RegenerationOption.Manual)]
    [Autodesk.Revit.Attributes.Transaction(Autodesk.Revit.Attributes.TransactionMode.Manual)]

    public class BIOC_ObjectsInsertion : IExternalDBApplication
    {

        public ExternalDBApplicationResult OnStartup(Autodesk.Revit.ApplicationServices.ControlledApplication app)
        {
            DesignAutomationBridge.DesignAutomationReadyEvent += HandleDesignAutomationReadyEvent;
            return ExternalDBApplicationResult.Succeeded;
        }

        public ExternalDBApplicationResult OnShutdown(Autodesk.Revit.ApplicationServices.ControlledApplication app)
        {
            return ExternalDBApplicationResult.Succeeded;
        }

        public void HandleDesignAutomationReadyEvent(object sender, DesignAutomationReadyEventArgs e)
        {
            e.Succeeded = true;
            InsertObjects(e.DesignAutomationData);
        }

        public static void InsertObjects(DesignAutomationData data)
        {
            //Get data from Design Automation
            if (data == null) throw new ArgumentNullException(nameof(data));

            Application rvtApp = data.RevitApp;
            if (rvtApp == null) throw new InvalidDataException(nameof(rvtApp));

            //Revit file path and open document
            string modelPath = data.FilePath;
            if (String.IsNullOrWhiteSpace(modelPath)) throw new InvalidDataException(nameof(modelPath));
            Document doc = data.RevitDoc;
            if (doc == null) throw new InvalidOperationException("Could not open document.");

            //Load all families in the model
            List<FamilyParams.BaseStruct> famParams = FamilyParams.Parse(@"families/list.json");
            using (Transaction tr_fam = new Transaction(doc, "SubTansactionLaodFamilies"))
            {
                tr_fam.Start();
                foreach (FamilyParams.BaseStruct _fam_params in famParams)
                {
                    using (SubTransaction subTr_fam = new SubTransaction(doc))
                    {
                        subTr_fam.Start();

                        string famName = _fam_params.path;

                        bool isLoaded = LoadFamily(doc, @"families/"+famName, famName.Replace(".rfa",""));

                        subTr_fam.Commit();
                    }
                }
                tr_fam.Commit();
            }


            //Params from JSON file
            List<InputParams.BaseStruct> inputParams = InputParams.Parse("params.json");
            if (inputParams == null) throw new InvalidOperationException("Cannot parse JSON");


            //Prepare output params
            List<OutputParams.BaseStruct> list_outputs = new List<OutputParams.BaseStruct>();

            using (Transaction tr = new Transaction(doc, "SubTransactionUses"))
            {
                tr.Start();
                foreach (InputParams.BaseStruct _params in inputParams)
                {
                    using (SubTransaction subTr = new SubTransaction(doc))
                    {
                        subTr.Start();

                        int elt_ID;
                        Element elt_create = null;
                        bool creation = true;

                        //Check if creation, if modification with PK or if modification without PK
                        if (!_params.creation)
                        {
                            elt_ID = (int)double.Parse(_params.RevitID, System.Globalization.CultureInfo.InvariantCulture);
                            
                            if (_params.positionModif) {
                                //PK and Properties modification => delete and create
                                doc.Delete(new ElementId(elt_ID));
                                creation = true;
                            }
                            else
                            {
                                elt_create = doc.GetElement(new ElementId(elt_ID));
                                creation = false;

                                if(elt_create == null) throw new InvalidOperationException("Revit ID is wrong !");
                            }
                        }

                        if (creation)
                        {
                            double x = double.Parse(_params.insertionPoint.x, System.Globalization.CultureInfo.InvariantCulture);
                            double y = double.Parse(_params.insertionPoint.y, System.Globalization.CultureInfo.InvariantCulture);
                            double z = double.Parse(_params.insertionPoint.z, System.Globalization.CultureInfo.InvariantCulture);

                            XYZ location = new XYZ(x / 0.3048, y / 0.3048, z / 0.3048);

                            Trace.WriteLine(location.ToString());

                            string familyName = _params.familyName;
                            string symbolName = _params.typeName;

                            Family family = null;
                            FamilySymbol symbol = null;

                            //Filter Element Collector
                            FilteredElementCollector FamiliesCollector = new FilteredElementCollector(doc);
                            FamiliesCollector.OfClass(typeof(Family));

                            var families = from m_family in FamiliesCollector
                                           where m_family.Name.ToLower() == familyName.ToLower()
                                           select m_family;
                            family = families.Cast<Family>().FirstOrDefault<Family>();

                            //If the family is not found in the document
                            if (family == null) throw new InvalidOperationException("The family " + familyName + " have not been found in the working document !");


                            //choose the familysymbol
                            if (symbolName != "")
                            {
                                //Symbol requested by the user
                                foreach (ElementId id in family.GetFamilySymbolIds())
                                {
                                    FamilySymbol tmp_symbol = doc.GetElement(id) as FamilySymbol;
                                    if (tmp_symbol.Name == symbolName)
                                    {
                                        symbol = tmp_symbol;
                                        break;
                                    }
                                }
                            }
                            else
                            {
                                //No symbol requested by the user so pick the first one
                                foreach (ElementId id in family.GetFamilySymbolIds())
                                {
                                    symbol = doc.GetElement(id) as FamilySymbol;
                                    break;
                                }
                            }

                            //Check if the symbol have been found
                            if (symbol == null) throw new InvalidOperationException("The symbol (.i.e. family type) " + symbolName + " have not been found in the family " + familyName);

                            //Activate the symbol
                            if (!symbol.IsActive)
                            { symbol.Activate(); doc.Regenerate(); }

                            //place the familyinstance   
                            elt_create = doc.Create.NewFamilyInstance(location, symbol, Autodesk.Revit.DB.Structure.StructuralType.NonStructural);

                            //Plan rotation
                            double angle_rotation = double.Parse(_params.angle, System.Globalization.CultureInfo.InvariantCulture);

                            //Rotation axis
                            double x_axis = double.Parse(_params.rotAxis.x, System.Globalization.CultureInfo.InvariantCulture);
                            double y_axis = double.Parse(_params.rotAxis.y, System.Globalization.CultureInfo.InvariantCulture);
                            double z_axis = double.Parse(_params.rotAxis.z, System.Globalization.CultureInfo.InvariantCulture);

                            XYZ axis_plan = new XYZ(x_axis / 0.3048, y_axis / 0.3048, z_axis / 0.3048);

                            Trace.WriteLine(axis_plan.ToString());

                            XYZ deb_plan = location;
                            XYZ fin_plan = deb_plan + axis_plan;
                            Line axis_plan_line = Line.CreateBound(deb_plan, fin_plan);
                            ElementTransformUtils.RotateElement(doc, elt_create.Id, axis_plan_line, -angle_rotation);
                        }


                        //SET THE PARAMETERS
                        if (_params.paramDict != null && _params.paramDict.Length > 0)
                        {
                            Trace.WriteLine(_params.paramDict[0].key.ToString());

                            for (int j = 0; j < _params.paramDict.Length; j++)
                            {
                                IList<Parameter> parameter = elt_create.GetParameters(_params.paramDict[j].key);
                                if (_params.paramDict[j].key != null && parameter.Count() != 0)
                                {
                                    if (parameter[0].Definition.UnitType == UnitType.UT_Length)
                                    {
                                        double val = double.Parse(_params.paramDict[j].value, System.Globalization.CultureInfo.InvariantCulture);
                                        parameter[0].Set(val / 0.3048);
                                    }
                                    else if (parameter[0].Definition.UnitType == UnitType.UT_Angle)
                                    {
                                        double val = double.Parse(_params.paramDict[j].value, System.Globalization.CultureInfo.InvariantCulture);
                                        parameter[0].Set(val * Math.PI / 180);
                                    }
                                    else
                                    {
                                        string val = _params.paramDict[j].value;
                                        parameter[0].Set(val);
                                    }
                                }
                            }
                        }

                        //fill output params
                        OutputParams.BaseStruct outputParams = new OutputParams.BaseStruct();
                        outputParams.id = _params.id;
                        outputParams.RevitID = elt_create.Id.IntegerValue;

                        if (_params.creation)
                        {
                            outputParams.status = "new";
                        }
                        else
                        {
                            if (_params.positionModif)
                            {
                                outputParams.status = "position";
                            }
                            else
                            {
                                outputParams.status = "parameters";
                            }
                        }
                        list_outputs.Add(outputParams);
                        subTr.Commit();
                    }
                }
                tr.Commit();
            }

            //Save JSON file
            string jsonContent = JsonConvert.SerializeObject(list_outputs);
            //write string to file
            File.WriteAllText("result.json", jsonContent);

            //Save Revit file
            ModelPath path = ModelPathUtils.ConvertUserVisiblePathToModelPath("result.rvt");
            doc.SaveAs(path, new SaveAsOptions());
        }

        public static bool LoadFamily(Document doc, string filePath, string _family_name)
        {
            Family family = null;

            FilteredElementCollector a = new FilteredElementCollector(doc).OfClass(typeof(Family));

            int n = a.Count<Element>(e => e.Name.Equals(_family_name));

            bool isLaoded = doc.LoadFamily(filePath, new MyFamilyLoadOptions(), out family);

            return isLaoded;
        }
    }

    /// <summary>
    /// InputParams is used to parse the input Json parameters
    /// </summary>
    internal class InputParams
    {
        public class BaseStruct
        {
            public BaseStruct()
            {

            }
            public int id { get; set; }
            public bool creation { get; set; }
            public bool positionModif { get; set; }
            public string RevitID { get; set; }
            public XYZStruct insertionPoint { get; set; }
            public string angle { get; set; }
            public XYZStruct rotAxis { get; set; }
            public string familyName { get; set; }
            public string typeName { get; set; }
            public ParamStruct[] paramDict;
        }

        public class XYZStruct
        {
            public XYZStruct()
            {

            }
            public string x { get; set; }
            public string y { get; set; }
            public string z { get; set; }
        }

        public class ParamStruct
        {
            public ParamStruct()
            {

            }
            public string key { get; set; }
            public string value { get; set; }
        }

        

        static public List<BaseStruct> Parse(string jsonPath)
        {
            try
            {
                Trace.WriteLine($"json location: {jsonPath}");
                string jsonContents = File.ReadAllText(jsonPath);
                Trace.WriteLine(jsonContents);
                return JsonConvert.DeserializeObject<List<BaseStruct>>(jsonContents);
            }
            catch (System.Exception ex)
            {
                Console.WriteLine("Exception when parsing json file: " + ex);
                return null;
            }
        }
    }

    /// <summary>
    /// InputParams is used to parse the input Json parameters
    /// </summary>
    internal class FamilyParams
    {
        public class BaseStruct
        {
            public BaseStruct()
            {

            }
            public string path { get; set; }
        }

        static public List<BaseStruct> Parse(string jsonPath)
        {
            try
            {
                Trace.WriteLine($"json location: {jsonPath}");
                string jsonContents = File.ReadAllText(jsonPath);
                Trace.WriteLine(jsonContents);
                return JsonConvert.DeserializeObject<List<BaseStruct>>(jsonContents);
            }
            catch (System.Exception ex)
            {
                Console.WriteLine("Exception when parsing json file: " + ex);
                return null;
            }
        }
    }

    /// <summary>
    /// InputParams is used to parse the input Json parameters
    /// </summary>
    internal class OutputParams
    {
        public class BaseStruct
        {
            public BaseStruct()
            {

            }
            public int id { get; set; }
            public int RevitID { get; set; }
            public string status { get; set; }
        }
    }

    class MyFamilyLoadOptions : IFamilyLoadOptions
    {
        public bool OnFamilyFound(
          bool familyInUse,
          out bool overwriteParameterValues)
        {
            overwriteParameterValues = true;
            return true;
        }

        public bool OnSharedFamilyFound(
          Family sharedFamily,
          bool familyInUse,
          out FamilySource source,
          out bool overwriteParameterValues)
        {
            source = FamilySource.Family;
            overwriteParameterValues = true;
            return true;
        }
    }
}
