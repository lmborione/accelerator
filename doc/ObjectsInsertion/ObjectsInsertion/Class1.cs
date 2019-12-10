using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Diagnostics;
using System.Collections;

using Autodesk.Revit.DB;
using Autodesk.Revit.DB.Architecture;
using Autodesk.Revit.UI;
using Autodesk.Revit.UI.Selection;
using Autodesk.Revit.ApplicationServices;
using Autodesk.Revit.Attributes;

using WinForms = System.Windows.Forms;
using X = Microsoft.Office.Interop.Excel;
using System.IO;

[TransactionAttribute(TransactionMode.Manual)]
[RegenerationAttribute(RegenerationOption.Manual)]

public class BIOC_ObjectsInsertion : IExternalCommand
{
    Hashtable myHashtable;

    public Result Execute(ExternalCommandData commandData, ref string message, ElementSet elements)
    {
        //Get process ids before running the excel codes
        CheckExcelProcesses();

        //Get application and document objects
        UIApplication uiApp = commandData.Application;
        UIDocument uidoc = uiApp.ActiveUIDocument;
        Document doc = uidoc.Document;
        Application app = uiApp.Application;


        /////////////////////AXE POLYLINE FROM AUTOCAD
        ////SELECTION
        Selection sel = uidoc.Selection;
        Reference r = sel.PickObject(ObjectType.Element,"Please pick an element");

        Element e = uidoc.Document.GetElement(r.ElementId);

        int polylineCounter = 0;

        ////GET GEOMETRY
        PolyLine axe = null;

        GeometryElement geoElement = e.get_Geometry(new Options());
        foreach (GeometryObject geoObject in geoElement)
        {
            GeometryInstance instance = geoObject as GeometryInstance;

            if (null != instance)
            {
                foreach (GeometryObject instObj in instance.SymbolGeometry)
                {
                    if (instObj is PolyLine)
                    {
                        ++polylineCounter;
                        axe = instObj as PolyLine;
                    }
                }
            }
        }
    
        ////ERRORS
        if (polylineCounter > 1)
        {
            // More than one axe
            TaskDialog.Show("Revit", "More than one alignment");
            return Result.Failed;
        }

        ////UI
        ObjectsInsertion.BIOC formui = new ObjectsInsertion.BIOC();
        WinForms.Application.Run(formui);

        //Inputs
        string Excel_filename = formui.Excel_filename;
        bool Excel_fail = formui.Excel_fail;
        int colonne_PK = ExcelColumnNameToNumber(formui.colonne_PK);
        int colonne_Family = ExcelColumnNameToNumber(formui.colonne_Family);
        bool AsParameters = formui.AsParameters;
        int colonne_Parametres = 0;
        if (AsParameters)
        {
            colonne_Parametres = ExcelColumnNameToNumber(formui.colonne_Parametres);
        }
        
        bool vertical = formui.vertical;
        bool buttonOK = formui.buttonOK;

        //ERREURS
        if (Excel_fail)
        {
            return Result.Failed;
        }

        //QUITTER
        if (buttonOK == false)
        {
            return Result.Cancelled;
        }

        /////////////////OBJECTS CREATION
        if (axe != null)
        {
            //Excel infos
            X.Application excel = formui.excel;
            if (null == excel)
            {
                return Result.Failed;
            }
            excel.Visible = false;
            X.Workbook workbook = formui.workbook;
            X.Worksheet worksheet = formui.worksheet;
            
            //Polylines Points
            IList<XYZ> list_pts = axe.GetCoordinates();

            //Number of PK
            int nb_pk = 0;
            while ((worksheet.Cells[nb_pk + 2, colonne_PK] as X.Range).Value != null)
            {
                nb_pk++;
            }

            //Number of Parameters
            int nb_params = 0;
            if (AsParameters)
            {
                while ((worksheet.Cells[1, colonne_Parametres + nb_params] as X.Range).Value != null)
                {
                    nb_params++;
                }
            }
            

            for (int i = 2; i < nb_pk+2; i++)
            {
                ////Point on Polyline
                double PK = Convert.ToDouble((worksheet.Cells[i, colonne_PK] as X.Range).Value2)/0.3048;
                XYZ location = point_PKsurPolyLines(PK, list_pts);

                ////FIND FAMILY             
                string family_input = (worksheet.Cells[i, colonne_Family] as X.Range).Value;

                string familyName = "";
                string symbolName = "";

                //Search for Symbol type (.i.e type name in the family)
                //Bracket will contain the symbol name in the Excel file
                if (family_input.Contains("(") && family_input.Contains(")"))
                {
                    string str = family_input.Replace(" ", "").Replace(")", "");
                    string[] cut_str = str.Split('(');
                    familyName = cut_str[0];
                    symbolName = cut_str[1];
                }
                else
                {
                    familyName = family_input.Replace(" ", "");
                }

                Family family = null;
                FamilySymbol symbol = null;

                //Filter Elment Collector
                FilteredElementCollector FamiliesCollector = new FilteredElementCollector(doc);
                FamiliesCollector.OfClass(typeof(Family));

                var families = from m_family in FamiliesCollector
                               where m_family.Name.ToLower() == familyName.ToLower()
                               select m_family;
                family = families.Cast<Family>().FirstOrDefault<Family>();

                //If the family is not found in the document
                if (family == null)
                {
                    WinForms.MessageBox.Show("The family " + familyName + " have not been found in the working document !");
                    workbook.Close(0);
                    excel.Quit();
                    KillExcel();
                    return Result.Cancelled;
                }


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
                    foreach(ElementId id in family.GetFamilySymbolIds())
                    {
                        symbol = doc.GetElement(id) as FamilySymbol;
                        break;
                    }
                }

                //Check if the symbol have been found
                if(symbol == null)
                {
                    WinForms.MessageBox.Show("The symbol (.i.e. family type) " + symbolName + " have not been found in the family " + familyName);
                    workbook.Close(0);
                    excel.Quit();
                    KillExcel();
                    return Result.Cancelled;
                }

                ////OBJECTS CREATION AND ROTATION
                using (Transaction trans = new Transaction(doc))
                {
                    trans.Start("start");
                
                    //Activate the symbol
                    if (!symbol.IsActive)
                    { symbol.Activate(); doc.Regenerate(); }

                    //place the familyinstance   
                    Element elt_create = doc.Create.NewFamilyInstance(location, symbol, Autodesk.Revit.DB.Structure.StructuralType.NonStructural);

                    //Plan rotation
                    double plan_rotation = angleplan_anglevert(PK, list_pts)[0];
                    XYZ axis_plan = Axis_angleplan_anglevert(PK, list_pts)[0];
                    XYZ deb_plan = location;
                    XYZ fin_plan = deb_plan + axis_plan;
                    Line axis_plan_line = Line.CreateBound(deb_plan, fin_plan);
                    ElementTransformUtils.RotateElement(doc, elt_create.Id, axis_plan_line, -plan_rotation);
                    
                    
                    //VERIF FAMILLE AND ROTATE
                    IList<Parameter> parameters_inclinaison = elt_create.GetParameters("Inclinaison");
                    if (parameters_inclinaison.Count() == 0)
                    {
                        if(vertical == false)
                        {
                            WinForms.MessageBox.Show("La famille ne peut pas supporter l'option orientation normale");
                            return Result.Failed;
                        }
                    }
                    else
                    {
                        if (vertical == false)
                        {
                            //Vertical rotation
                            double vert_rotation = Math.PI / 2 + angleplan_anglevert(PK, list_pts)[1];
                            parameters_inclinaison[0].Set(vert_rotation);
                        }
                        else
                        {
                            //Vertical rotation
                            double vert_rotation = Math.PI / 2;
                            parameters_inclinaison[0].Set(vert_rotation);
                        }
                    }

                    //SET THE PARAMETER (FAIRE LES VERIFS)
                    if (AsParameters)
                    {
                        for(int j = colonne_Parametres; j< colonne_Parametres + nb_params; j++)
                        {
                            IList<Parameter> parameter = elt_create.GetParameters((worksheet.Cells[1, j] as X.Range).Value);
                            if ((worksheet.Cells[i, j] as X.Range).Value != null && parameter.Count()!=0)
                            {
                                if (parameter[0].Definition.UnitType == UnitType.UT_Length)
                                {
                                    parameter[0].Set((worksheet.Cells[i, j] as X.Range).Value/0.3048);
                                }else if (parameter[0].Definition.UnitType == UnitType.UT_Angle)
                                {
                                    parameter[0].Set((worksheet.Cells[i, j] as X.Range).Value * Math.PI / 180);
                                }
                                else
                                {
                                    parameter[0].Set((worksheet.Cells[i, j] as X.Range).Value);
                                }
                            }                        
                        }
                    }

                    trans.Commit();
                }
            }

            workbook.Close(0);
            excel.Quit();
            KillExcel();

        }

        return Result.Succeeded;
    }







    public XYZ point_PKsurPolyLines(double PK, IList<XYZ> list_pts)
    {
        
        XYZ sortie = new XYZ();
        List<double> list_PK = new List<double>();
        double inc_PK = 0;


        for(int i = 0; i<list_pts.Count-1; i++)
        {
            double distance = (new XYZ(list_pts[i].X, list_pts[i].Y, 0)).DistanceTo(new XYZ(list_pts[i+1].X, list_pts[i+1].Y, 0));
            inc_PK += distance;
            list_PK.Add(inc_PK);
        }


        for (int i = 0; i < list_PK.Count; i++)
        {
            if (list_PK[i] > PK)
            {
                XYZ n_plan = (new XYZ(list_pts[i + 1].X - list_pts[i].X, list_pts[i + 1].Y - list_pts[i].Y, 0)).Normalize();

                double long_seg = (new XYZ(list_pts[i + 1].X - list_pts[i].X, list_pts[i + 1].Y - list_pts[i].Y, 0)).GetLength();

                XYZ sortie_plan = new XYZ(list_pts[i].X, list_pts[i].Y, 0) + n_plan * (PK - (list_PK[i] - long_seg));

                double z =  list_pts[i].Z + ((PK - (list_PK[i]-long_seg)) / long_seg) * (list_pts[i + 1].Z - list_pts[i].Z);

                sortie = sortie_plan + new XYZ(0,0,z);

                return sortie;
            }
        }

        return sortie;
    }

    public List<double> angleplan_anglevert(double PK, IList<XYZ> list_pts)
    {

        List<double> sortie = new List<double>();
        List<double> list_PK = new List<double>();
        double inc_PK = 0;


        for (int i = 0; i < list_pts.Count - 1; i++)
        {
            double distance = (new XYZ(list_pts[i].X, list_pts[i].Y, 0)).DistanceTo(new XYZ(list_pts[i + 1].X, list_pts[i + 1].Y, 0));
            inc_PK += distance;
            list_PK.Add(inc_PK);
        }


        for (int i = 0; i < list_PK.Count; i++)
        {
            if (list_PK[i] > PK)
            {
                XYZ n_plan = (new XYZ(list_pts[i + 1].X - list_pts[i].X, list_pts[i + 1].Y - list_pts[i].Y, 0)).Normalize();
                XYZ axe_Y = new XYZ(0, 1, 0);
                double angleplan = n_plan.AngleTo(axe_Y);
                sortie.Add(angleplan);

                double opp = list_pts[i + 1].Z - list_pts[i].Z;
                double hyp = list_pts[i].DistanceTo(list_pts[i + 1]);
                double anglevert = Math.Asin(Math.Abs(opp)/hyp);
                if (opp >= 0)
                {
                    sortie.Add(anglevert);
                }else
                {
                    sortie.Add(-anglevert);
                }
                return sortie;
            }
        }

        return sortie;
    }

    public List<XYZ> Axis_angleplan_anglevert(double PK, IList<XYZ> list_pts)
    {

        List<XYZ> sortie = new List<XYZ>();
        List<double> list_PK = new List<double>();
        double inc_PK = 0;


        for (int i = 0; i < list_pts.Count - 1; i++)
        {
            double distance = (new XYZ(list_pts[i].X, list_pts[i].Y, 0)).DistanceTo(new XYZ(list_pts[i + 1].X, list_pts[i + 1].Y, 0));
            inc_PK += distance;
            list_PK.Add(inc_PK);
        }


        for (int i = 0; i < list_PK.Count; i++)
        {
            if (list_PK[i] > PK)
            {
                XYZ n_plan = (new XYZ(list_pts[i + 1].X - list_pts[i].X, list_pts[i + 1].Y - list_pts[i].Y, 0)).Normalize();
                XYZ axe_Y = new XYZ(0, 1, 0);
                XYZ AXIS_angleplan = n_plan.CrossProduct(axe_Y);
                sortie.Add(AXIS_angleplan);

                XYZ n = list_pts[i + 1] - list_pts[i];
                XYZ AXIS_anglevert = n.CrossProduct(n_plan);
                sortie.Add(AXIS_anglevert);

                return sortie;
            }
        }

        return sortie;
    }

    public int ExcelColumnNameToNumber(string columnName)
    {
        if (string.IsNullOrEmpty(columnName)) throw new ArgumentNullException("columnName");

        columnName = columnName.ToUpperInvariant();

        int sum = 0;

        for (int i = 0; i < columnName.Length; i++)
        {
            sum *= 26;
            sum += (columnName[i] - 'A' + 1);
        }

        return sum;
    }

    private void CheckExcelProcesses()
    {
        Process[] AllProcesses = Process.GetProcessesByName("excel");
        myHashtable = new Hashtable();
        int iCount = 0;

        foreach (Process ExcelProcess in AllProcesses)
        {
            myHashtable.Add(ExcelProcess.Id, iCount);
            iCount = iCount + 1;
        }
    }

    private void KillExcel()
    {
        Process[] AllProcesses = Process.GetProcessesByName("excel");

        // check to kill the right process
        foreach (Process ExcelProcess in AllProcesses)
        {
            if (myHashtable.ContainsKey(ExcelProcess.Id) == false)
                ExcelProcess.Kill();
        }
        AllProcesses = null;
    }


}
