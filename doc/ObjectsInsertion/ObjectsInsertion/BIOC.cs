using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using X = Microsoft.Office.Interop.Excel;

namespace ObjectsInsertion
{
    public partial class BIOC : Form
    {
        public bool BIOC_close = false;
        public string Excel_filename = "";
        public bool Excel_fail = false;
        public X.Workbook workbook;
        public X.Sheets worksheets;
        public X.Worksheet worksheet;
        public string colonne_PK;
        public string colonne_Family;
        public string colonne_Parametres;
        public bool AsParameters = false;
        public bool vertical = true;
        public bool buttonOK = false;
        public X.Application excel;


        public BIOC()
        {
            InitializeComponent();
        }

        private void button_OK_Click(object sender, EventArgs e)
        {
            bool verif_colonneparam = true;
            if (checkBox_Parametres.Checked == true)
            {
                if (String.IsNullOrEmpty(textBox_colonneDebutParametre.Text) == true)
                {
                    verif_colonneparam = false;
                }
            }

            if (String.IsNullOrEmpty(textBox_colonnePK.Text)==false && String.IsNullOrEmpty(textBox_colonneFamille.Text) == false && String.IsNullOrEmpty(textBox_fichierExcel.Text) == false && String.IsNullOrEmpty(comboBox_FeuilleExcel.Text) == false && verif_colonneparam)
            {
                this.colonne_PK = textBox_colonnePK.Text;
                this.colonne_Family = textBox_colonneFamille.Text;
                this.colonne_Parametres = textBox_colonneDebutParametre.Text;
                this.AsParameters = checkBox_Parametres.Checked;
                this.vertical = checkBox_Vertical.Checked;
                Close();
                this.buttonOK = true;
            }else
            {
                MessageBox.Show("Veuillez remplir correctement le formulaire");
            }         
        }

        private void button_OuvrirFichierExcel_Click(object sender, EventArgs e)
        {
            // Let user select the Excel file
            OpenFileDialog dlg = new OpenFileDialog();
            dlg.Title = "Select source Excel file";
            dlg.Filter = "Excel spreadsheet files (*.xls;*.xlsx)|*.xls;*.xlsx|All files (*)|*";
            if (DialogResult.OK != dlg.ShowDialog())
            {
                Excel_fail = true;
            }
            Excel_filename = dlg.FileName;
            textBox_fichierExcel.Text = Excel_filename;

            this.excel = new X.Application();
            this.excel.Visible = false;
            workbook = this.excel.Workbooks.Open(Excel_filename);
            worksheets = workbook.Worksheets;
            foreach (X.Worksheet sheet in worksheets)
            {
                comboBox_FeuilleExcel.Items.Add(sheet.Name);
            }
            label_FeuilleExcel.Visible = true;
            comboBox_FeuilleExcel.Visible = true;
        }

        private void comboBox_FeuilleExcel_SelectedIndexChanged(object sender, EventArgs e)
        {
            string result_comboBox = (string)comboBox_FeuilleExcel.SelectedItem;
            worksheet = (X.Worksheet)worksheets.get_Item(result_comboBox);
        }

        private void checkBox_Parametres_CheckedChanged(object sender, EventArgs e)
        {
            if (checkBox_Parametres.Checked == false)
            {
                label_colonneDebutParametre.Visible = false;
                textBox_colonneDebutParametre.Visible = false;
                this.AsParameters = false;
            }else
            {
                label_colonneDebutParametre.Visible = true;
                textBox_colonneDebutParametre.Visible = true;
                this.AsParameters = true;
            }
        }

        private void checkBox_Vertical_CheckedChanged(object sender, EventArgs e)
        {
            if (checkBox_Vertical.Checked == false)
            {
                this.vertical = false;
                checkBox_Normal.Checked = true;
                checkBox_Vertical.Checked = false;
            }
            else
            {
                this.vertical = true;
                checkBox_Normal.Checked = false;
                checkBox_Vertical.Checked = true;
            }
        }

        private void checkBox_Normal_CheckedChanged(object sender, EventArgs e)
        {
            if (checkBox_Normal.Checked == true)
            {
                this.vertical = false;
                checkBox_Normal.Checked = true;
                checkBox_Vertical.Checked = false;
            }
            else
            {
                this.vertical = true;
                checkBox_Normal.Checked = false;
                checkBox_Vertical.Checked = true;
            }
        }
    }
}
