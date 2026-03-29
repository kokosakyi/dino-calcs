import Specie from './Specie';
import Grade from './Grade';

class SawnTimber {
    constructor(specie, grade) {
        this.specie = new Specie(specie).getSelectedSpecie();
        this.grade = new Grade(grade).getSelectedGrade();
    }

    getSpecie = ()=> {
        return this.specie;
    }

    getGrade = ()=> {
        return this.grade;
    }

    getReference = ()=> {
        return 'CSA 086 Table 6.3.1C';
    }

    // method to set and return bending stress of sawn timber
    fb = () => {
        let fb_value = 0;
        switch (this.specie.name) {
            case 'Douglas Fir-Larch':
                switch (this.grade.name) {
                    case 'Select Structural':
                        fb_value = 19.5;
                        break;
                    case 'No. 1 Grade':
                        fb_value = 15.8;
                        break;
                    case 'No. 2 Grade':
                        fb_value = 9.0;
                        break;
                    default:
                        fb_value = 9.0;
                }
                break;
            case 'Hem-Fir':
                switch (this.grade.name) {
                    case 'Select Structural':
                        fb_value = 14.5;
                        break;
                    case 'No. 1 Grade':
                        fb_value = 11.7;
                        break;
                    case 'No. 2 Grade':
                        fb_value = 6.7;
                        break;
                    default:
                        fb_value = 6.7;
                }
                break;
            case 'Spruce-Pine-Fir':
                switch (this.grade.name) {
                    case 'Select Structural':
                        fb_value = 13.6;
                        break;
                    case 'No. 1 Grade':
                        fb_value = 11.0;
                        break;
                    case 'No. 2 Grade':
                        fb_value = 6.3;
                        break;
                    default:
                        fb_value = 6.3;
                }
                break;
            case 'Northern Specie':
                switch (this.grade.name) {
                    case 'Select Structural':
                        fb_value = 12.8;
                        break;
                    case 'No. 1 Grade':
                        fb_value = 10.8;
                        break;
                    case 'No. 2 Grade':
                        fb_value = 5.9;
                        break;
                    default:
                        fb_value = 5.9;
                }
                break;
            default:
                fb_value = 0;
        }
        return fb_value;
    }

    // method to set and longitudinal shear stress of sawn lumber
    fv = () => {
        let fv_value = 0;
        switch (this.specie.name) {
            case 'Douglas Fir-Larch':
                fv_value = 1.5;
                break;
            case 'Hem-Fir':
                fv_value = 1.2;
                break;
            case 'Spruce-Pine-Fir':
                fv_value = 1.2;
                break;
            case 'Northern Specie':
                fv_value = 1.0;
                break;
            default:
                fv_value = 0;
        }
        return fv_value;
    }

    // method to set and return compression parallel to grain of sawn lumber
    fc = () => {
        let fc_value = 0;
        switch (this.specie.name) {
            case 'Douglas Fir-Larch':
                switch (this.grade.name) {
                    case 'Select Structural':
                        fc_value = 13.2;
                        break;
                    case 'No. 1 Grade':
                        fc_value = 11.0;
                        break;
                    case 'No. 2 Grade':
                        fc_value = 7.2;
                        break;
                    default:
                        fc_value = 7.2;
                }
                break;
            case 'Hem-Fir':
                switch (this.grade.name) {
                    case 'Select Structural':
                        fc_value = 10.8;
                        break;
                    case 'No. 1 Grade':
                        fc_value = 9.0;
                        break;
                    case 'No. 2 Grade':
                        fc_value = 5.9;
                        break;
                    default:
                        fc_value = 5.9;
                }
                break;
            case 'Spruce-Pine-Fir':
                switch (this.grade.name) {
                    case 'Select Structural':
                        fc_value = 9.5;
                        break;
                    case 'No. 1 Grade':
                        fc_value = 7.9;
                        break;
                    case 'No. 2 Grade':
                        fc_value = 5.2;
                        break;
                    default:
                        fc_value = 5.2;
                }
                break;
            case 'Northern Specie':
                switch (this.grade.name) {
                    case 'Select Structural':
                        fc_value = 7.2;
                        break;
                    case 'No. 1 Grade':
                        fc_value = 6.0;
                        break;
                    case 'No. 2 Grade':
                        fc_value = 3.9;
                        break;
                    default:
                        fc_value = 3.9;
                }
                break;
            default:
                fc_value = 0;
        }
        return fc_value;
    }

    // method to set and return compressive stress perpendicular to grain of sawn lumber
    fcp = () => {
        let fcp_value = 0;
        switch (this.specie.name) {
            case 'Douglas Fir-Larch':
                fcp_value = 7.0;
                break;
            case 'Hem-Fir':
                fcp_value = 4.6;
                break;
            case 'Spruce-Pine-Fir':
                fcp_value = 5.3;
                break;
            case 'Northern Specie':
                fcp_value = 3.5;
                break;
            default:
                fcp_value = 0;
        }
        return fcp_value;
    }

    // method to set and return tension parallel to grain of sawn lumber
    ft = () => {
        let ft_value = 0;
        switch (this.specie.name) {
            case 'Douglas Fir-Larch':
                switch (this.grade.name) {
                    case 'Select Structural':
                        ft_value = 10.0;
                        break;
                    case 'No. 1 Grade':
                        ft_value = 7.0;
                        break;
                    case 'No. 2 Grade':
                        ft_value = 3.3;
                        break;
                    default:
                        ft_value = 3.3;
                }
                break;
            case 'Hem-Fir':
                switch (this.grade.name) {
                    case 'Select Structural':
                        ft_value = 7.4;
                        break;
                    case 'No. 1 Grade':
                        ft_value = 5.2;
                        break;
                    case 'No. 2 Grade':
                        ft_value = 2.4;
                        break;
                    default:
                        ft_value = 2.4;
                }
                break;
            case 'Spruce-Pine-Fir':
                switch (this.grade.name) {
                    case 'Select Structural':
                        ft_value = 7.0;
                        break;
                    case 'No. 1 Grade':
                        ft_value = 4.9;
                        break;
                    case 'No. 2 Grade':
                        ft_value = 2.3;
                        break;
                    default: 
                        ft_value = 2.3;
                }
                break;
            case 'Northern Specie':
                switch (this.grade.name) {
                    case 'Select Structural':
                        ft_value = 6.5;
                        break;
                    case 'No. 1 Grade':
                        ft_value = 4.6;
                        break;
                    case 'No. 2 Grade':
                        ft_value = 2.2;
                        break;
                    default:
                        ft_value = 2.2;
                }
                break;
            default:
                ft_value = 0;
        }
        return ft_value;
    }

    // method to set and return tension parallel to grain of sawn lumber
    E = () => {
        let E_value = 0;
        switch (this.specie.name) {
            case 'Douglas Fir-Larch':
                switch (this.grade.name) {
                    case 'Select Structural':
                        E_value = 12000;
                        break;
                    case 'No. 1 Grade':
                        E_value = 12000;
                        break;
                    case 'No. 2 Grade':
                        E_value = 9500;
                        break;
                    default: 
                        E_value = 9500;
                }
                break;
            case 'Hem-Fir':
                switch (this.grade.name) {
                    case 'Select Structural':
                        E_value = 10000;
                        break;
                    case 'No. 1 Grade':
                        E_value = 10000;
                        break;
                    case 'No. 2 Grade':
                        E_value = 8000;
                        break;
                    default:
                        E_value = 8000;
                }
                break;
            case 'Spruce-Pine-Fir':
                switch (this.grade.name) {
                    case 'Select Structural':
                        E_value = 8500;
                        break;
                    case 'No. 1 Grade':
                        E_value = 8500;
                        break;
                    case 'No. 2 Grade':
                        E_value = 6500;
                        break;
                    default:
                        E_value = 6500;
                }
                break;
            case 'Northern Specie':
                switch (this.grade.name) {
                    case 'Select Structural':
                        E_value = 8000;
                        break;
                    case 'No. 1 Grade':
                        E_value = 8000;
                        break;
                    case 'No. 2 Grade':
                        E_value = 6000;
                        break;
                    default:
                        E_value = 6000;
                }
                break;
            default:
                E_value = 0;
        }
        return E_value;
    }

    // method to set and return tension parallel to grain of sawn lumber
    E05 = () => {
        let E05_value = 0;
        switch (this.specie.name) {
            case 'Douglas Fir-Larch':
                switch (this.grade.name) {
                    case 'Select Structural':
                        E05_value = 8000;
                        break;
                    case 'No. 1 Grade':
                        E05_value = 8000;
                        break;
                    case 'No. 2 Grade':
                        E05_value = 6000;
                        break;
                    default:
                        E05_value = 6000;
                }
                break;
            case 'Hem-Fir':
                switch (this.grade.name) {
                    case 'Select Structural':
                        E05_value = 7000;
                        break;
                    case 'No. 1 Grade':
                        E05_value = 7000;
                        break;
                    case 'No. 2 Grade':
                        E05_value = 5500;
                        break;
                    default:
                        E05_value = 5500;
                }
                break;
            case 'Spruce-Pine-Fir':
                switch (this.grade.name) {
                    case 'Select Structural':
                        E05_value = 6000;
                        break;
                    case 'No. 1 Grade':
                        E05_value = 6000;
                        break;
                    case 'No. 2 Grade':
                        E05_value = 4500;
                        break;
                    default:
                        E05_value = 4500;
                }
                break;
            case 'Northern Specie':
                switch (this.grade.name) {
                    case 'Select Structural':
                        E05_value = 5500;
                        break;
                    case 'No. 1 Grade':
                        E05_value = 5500;
                        break;
                    case 'No. 2 Grade':
                        E05_value = 4000;
                        break;
                    default:
                        E05_value = 4000;
                }
                break;
            default:
                E05_value = 0;
        }
        return E05_value;
    }

}

export default SawnTimber;