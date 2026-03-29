class Grade {
    constructor(selectedGrade) {
        this.grades = [{
                abbreviation: "SS",
                name: "Select Structural"
            },
            {
                abbreviation: "No. 1",
                name: "No. 1 Grade"
            },
            {
                abbreviation: "No. 2",
                name: "No. 2 Grade"
            },
            {
                abbreviation: "No. 3",
                name: "No. 3 Grade"
            }
        ]
        this.selectedGrade = selectedGrade;
    }

    getGrades = () => {
        return this.grades;
    }

    getSelectedGrade = () => {
        const selGrade = this.grades.filter(grade => grade.name === this.selectedGrade)[0];
        return selGrade;
    }

}

export default Grade;