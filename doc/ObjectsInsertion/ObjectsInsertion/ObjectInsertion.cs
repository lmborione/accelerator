﻿using System;
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
            //string modelPath = "RevitInput.rvt";
            if (String.IsNullOrWhiteSpace(modelPath)) throw new InvalidDataException(nameof(modelPath));
            Document doc = data.RevitDoc;
            if (doc == null) throw new InvalidOperationException("Could not open document.");

            //Params from JSON file
            List< InputParams.BaseStruct> inputParams = InputParams.Parse("params.json");
            //InputParams inputParams = InputParams.Parse("params.json");
            if (inputParams == null) throw new InvalidOperationException("Cannot parse JSON");

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
                        subTr.Commit();
                    }
                }
                tr.Commit();
            }
        }

        //private static bool GetOnDemandFile(string name, string suffix, string headers, string responseFile)
        //{
        //    // writing a string (formatted according to ACESAPI format) to trace
        //    // invokes the onDemand call to get the desired optional input file
        //    LogTrace("!ACESAPI:acesHttpOperation({0},{1},{2},{3},{4})",
        //        name ?? "", suffix ?? "", headers ?? "", "", responseFile ?? "");

        //    // waiting for a control character indicating
        //    // that the download has successfully finished
        //    int idx = 0;
        //    while (true)
        //    {
        //        char ch = Convert.ToChar(Console.Read());
        //        // error
        //        if (ch == '\x3')
        //        {
        //            return false;
        //        }
        //        // success
        //        else if (ch == '\n')
        //        {
        //            return true;
        //        }

        //        // to many unexpected characters already read from console,
        //        // treating as other error / timeout
        //        if (idx >= 16)
        //        {
        //            return false;
        //        }
        //        idx++;
        //    }
        //}
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
    internal class FamilyList
    {
        public class BaseStruct
        {
            public BaseStruct()
            {

            }
            public string familyName { get; set; }
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
}
