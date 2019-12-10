namespace ObjectsInsertion
{
    partial class BIOC
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            this.textBox_fichierExcel = new System.Windows.Forms.TextBox();
            this.label_OuvrirExcel = new System.Windows.Forms.Label();
            this.button_OuvrirFichierExcel = new System.Windows.Forms.Button();
            this.comboBox_FeuilleExcel = new System.Windows.Forms.ComboBox();
            this.label_FeuilleExcel = new System.Windows.Forms.Label();
            this.label_colonnePK = new System.Windows.Forms.Label();
            this.textBox_colonnePK = new System.Windows.Forms.TextBox();
            this.textBox_colonneFamille = new System.Windows.Forms.TextBox();
            this.label_colonneFamille = new System.Windows.Forms.Label();
            this.checkBox_Parametres = new System.Windows.Forms.CheckBox();
            this.textBox_colonneDebutParametre = new System.Windows.Forms.TextBox();
            this.label_colonneDebutParametre = new System.Windows.Forms.Label();
            this.checkBox_Vertical = new System.Windows.Forms.CheckBox();
            this.checkBox_Normal = new System.Windows.Forms.CheckBox();
            this.button_OK = new System.Windows.Forms.Button();
            this.SuspendLayout();
            // 
            // textBox_fichierExcel
            // 
            this.textBox_fichierExcel.Location = new System.Drawing.Point(115, 25);
            this.textBox_fichierExcel.Name = "textBox_fichierExcel";
            this.textBox_fichierExcel.Size = new System.Drawing.Size(222, 22);
            this.textBox_fichierExcel.TabIndex = 0;
            // 
            // label_OuvrirExcel
            // 
            this.label_OuvrirExcel.AutoSize = true;
            this.label_OuvrirExcel.Location = new System.Drawing.Point(14, 27);
            this.label_OuvrirExcel.Name = "label_OuvrirExcel";
            this.label_OuvrirExcel.Size = new System.Drawing.Size(87, 17);
            this.label_OuvrirExcel.TabIndex = 1;
            this.label_OuvrirExcel.Text = "Fichier Excel";
            // 
            // button_OuvrirFichierExcel
            // 
            this.button_OuvrirFichierExcel.Location = new System.Drawing.Point(353, 25);
            this.button_OuvrirFichierExcel.Name = "button_OuvrirFichierExcel";
            this.button_OuvrirFichierExcel.Size = new System.Drawing.Size(75, 23);
            this.button_OuvrirFichierExcel.TabIndex = 2;
            this.button_OuvrirFichierExcel.Text = "Ouvrir";
            this.button_OuvrirFichierExcel.UseVisualStyleBackColor = true;
            this.button_OuvrirFichierExcel.Click += new System.EventHandler(this.button_OuvrirFichierExcel_Click);
            // 
            // comboBox_FeuilleExcel
            // 
            this.comboBox_FeuilleExcel.FormattingEnabled = true;
            this.comboBox_FeuilleExcel.Location = new System.Drawing.Point(115, 65);
            this.comboBox_FeuilleExcel.Name = "comboBox_FeuilleExcel";
            this.comboBox_FeuilleExcel.Size = new System.Drawing.Size(222, 24);
            this.comboBox_FeuilleExcel.TabIndex = 3;
            this.comboBox_FeuilleExcel.SelectedIndexChanged += new System.EventHandler(this.comboBox_FeuilleExcel_SelectedIndexChanged);
            // 
            // label_FeuilleExcel
            // 
            this.label_FeuilleExcel.AutoSize = true;
            this.label_FeuilleExcel.Location = new System.Drawing.Point(15, 69);
            this.label_FeuilleExcel.Name = "label_FeuilleExcel";
            this.label_FeuilleExcel.Size = new System.Drawing.Size(86, 17);
            this.label_FeuilleExcel.TabIndex = 4;
            this.label_FeuilleExcel.Text = "Feuille Excel";
            // 
            // label_colonnePK
            // 
            this.label_colonnePK.AutoSize = true;
            this.label_colonnePK.Location = new System.Drawing.Point(19, 118);
            this.label_colonnePK.Name = "label_colonnePK";
            this.label_colonnePK.Size = new System.Drawing.Size(82, 17);
            this.label_colonnePK.TabIndex = 5;
            this.label_colonnePK.Text = "Colonne PK";
            // 
            // textBox_colonnePK
            // 
            this.textBox_colonnePK.Location = new System.Drawing.Point(120, 116);
            this.textBox_colonnePK.Name = "textBox_colonnePK";
            this.textBox_colonnePK.Size = new System.Drawing.Size(44, 22);
            this.textBox_colonnePK.TabIndex = 6;
            // 
            // textBox_colonneFamille
            // 
            this.textBox_colonneFamille.Location = new System.Drawing.Point(347, 116);
            this.textBox_colonneFamille.Name = "textBox_colonneFamille";
            this.textBox_colonneFamille.Size = new System.Drawing.Size(44, 22);
            this.textBox_colonneFamille.TabIndex = 8;
            // 
            // label_colonneFamille
            // 
            this.label_colonneFamille.AutoSize = true;
            this.label_colonneFamille.Location = new System.Drawing.Point(237, 118);
            this.label_colonneFamille.Name = "label_colonneFamille";
            this.label_colonneFamille.Size = new System.Drawing.Size(108, 17);
            this.label_colonneFamille.TabIndex = 7;
            this.label_colonneFamille.Text = "Colonne Famille";
            // 
            // checkBox_Parametres
            // 
            this.checkBox_Parametres.AutoSize = true;
            this.checkBox_Parametres.Location = new System.Drawing.Point(27, 170);
            this.checkBox_Parametres.Name = "checkBox_Parametres";
            this.checkBox_Parametres.Size = new System.Drawing.Size(103, 21);
            this.checkBox_Parametres.TabIndex = 9;
            this.checkBox_Parametres.Text = "Paramètres";
            this.checkBox_Parametres.UseVisualStyleBackColor = true;
            this.checkBox_Parametres.CheckedChanged += new System.EventHandler(this.checkBox_Parametres_CheckedChanged);
            // 
            // textBox_colonneDebutParametre
            // 
            this.textBox_colonneDebutParametre.Location = new System.Drawing.Point(348, 169);
            this.textBox_colonneDebutParametre.Name = "textBox_colonneDebutParametre";
            this.textBox_colonneDebutParametre.Size = new System.Drawing.Size(44, 22);
            this.textBox_colonneDebutParametre.TabIndex = 11;
            this.textBox_colonneDebutParametre.Visible = false;
            // 
            // label_colonneDebutParametre
            // 
            this.label_colonneDebutParametre.AutoSize = true;
            this.label_colonneDebutParametre.Location = new System.Drawing.Point(168, 172);
            this.label_colonneDebutParametre.Name = "label_colonneDebutParametre";
            this.label_colonneDebutParametre.Size = new System.Drawing.Size(179, 17);
            this.label_colonneDebutParametre.TabIndex = 10;
            this.label_colonneDebutParametre.Text = "Colonne Debut Paramètres";
            this.label_colonneDebutParametre.Visible = false;
            // 
            // checkBox_Vertical
            // 
            this.checkBox_Vertical.AutoSize = true;
            this.checkBox_Vertical.Checked = true;
            this.checkBox_Vertical.CheckState = System.Windows.Forms.CheckState.Checked;
            this.checkBox_Vertical.Location = new System.Drawing.Point(77, 230);
            this.checkBox_Vertical.Name = "checkBox_Vertical";
            this.checkBox_Vertical.Size = new System.Drawing.Size(77, 21);
            this.checkBox_Vertical.TabIndex = 12;
            this.checkBox_Vertical.Text = "Vertical";
            this.checkBox_Vertical.UseVisualStyleBackColor = true;
            this.checkBox_Vertical.CheckedChanged += new System.EventHandler(this.checkBox_Vertical_CheckedChanged);
            // 
            // checkBox_Normal
            // 
            this.checkBox_Normal.AutoSize = true;
            this.checkBox_Normal.Location = new System.Drawing.Point(260, 230);
            this.checkBox_Normal.Name = "checkBox_Normal";
            this.checkBox_Normal.Size = new System.Drawing.Size(75, 21);
            this.checkBox_Normal.TabIndex = 13;
            this.checkBox_Normal.Text = "Normal";
            this.checkBox_Normal.UseVisualStyleBackColor = true;
            this.checkBox_Normal.CheckedChanged += new System.EventHandler(this.checkBox_Normal_CheckedChanged);
            // 
            // button_OK
            // 
            this.button_OK.Location = new System.Drawing.Point(173, 273);
            this.button_OK.Name = "button_OK";
            this.button_OK.Size = new System.Drawing.Size(96, 27);
            this.button_OK.TabIndex = 14;
            this.button_OK.Text = "OK";
            this.button_OK.UseVisualStyleBackColor = true;
            this.button_OK.Click += new System.EventHandler(this.button_OK_Click);
            // 
            // BIOC
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(8F, 16F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(449, 308);
            this.Controls.Add(this.button_OK);
            this.Controls.Add(this.checkBox_Normal);
            this.Controls.Add(this.checkBox_Vertical);
            this.Controls.Add(this.textBox_colonneDebutParametre);
            this.Controls.Add(this.label_colonneDebutParametre);
            this.Controls.Add(this.checkBox_Parametres);
            this.Controls.Add(this.textBox_colonneFamille);
            this.Controls.Add(this.label_colonneFamille);
            this.Controls.Add(this.textBox_colonnePK);
            this.Controls.Add(this.label_colonnePK);
            this.Controls.Add(this.label_FeuilleExcel);
            this.Controls.Add(this.comboBox_FeuilleExcel);
            this.Controls.Add(this.button_OuvrirFichierExcel);
            this.Controls.Add(this.label_OuvrirExcel);
            this.Controls.Add(this.textBox_fichierExcel);
            this.Name = "BIOC";
            this.Text = "BIOC";
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.TextBox textBox_fichierExcel;
        private System.Windows.Forms.Label label_OuvrirExcel;
        private System.Windows.Forms.Button button_OuvrirFichierExcel;
        private System.Windows.Forms.ComboBox comboBox_FeuilleExcel;
        private System.Windows.Forms.Label label_FeuilleExcel;
        private System.Windows.Forms.Label label_colonnePK;
        private System.Windows.Forms.TextBox textBox_colonnePK;
        private System.Windows.Forms.TextBox textBox_colonneFamille;
        private System.Windows.Forms.Label label_colonneFamille;
        private System.Windows.Forms.CheckBox checkBox_Parametres;
        private System.Windows.Forms.TextBox textBox_colonneDebutParametre;
        private System.Windows.Forms.Label label_colonneDebutParametre;
        private System.Windows.Forms.CheckBox checkBox_Vertical;
        private System.Windows.Forms.CheckBox checkBox_Normal;
        private System.Windows.Forms.Button button_OK;
    }
}