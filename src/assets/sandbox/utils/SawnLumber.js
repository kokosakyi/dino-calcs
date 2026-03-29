import Specie from './Specie';
import Grade from './Grade';

class SawnLumber {
    constructor(specie, grade) {
        this.specie = new Specie(specie).getSelectedSpecie();
        this.grade = new Grade(grade).getSelectedGrade();
    }

    getSpecie = () => {
        return this.specie;
    }

    getGrade = () => {
        return this.grade;
    }

    getReference = () => {
        return 'CSA O86 Table 6.3.1A';
    }

    // method to set and return bending stress of sawn lumber
    fb = () => {
        let fb_value = 0;
        switch (this.specie.name) {
            case 'Douglas Fir-Larch':
                switch (this.grade.name) {
                    case 'Select Structural':
                        fb_value = 16.5;
                        break;
                    case 'No. 1 Grade':
                        fb_value = 10.0;
                        break;
                    case 'No. 2 Grade':
                        fb_value = 10.0;
                        break;
                    case 'No. 3 Grade':
                        fb_value = 4.6;
                        break;
                    default:
                        fb_value = 10.0;
                }
                break;
            case 'Hem-Fir':
                switch (this.grade.name) {
                    case 'Select Structural':
                        fb_value = 16.0;
                        break;
                    case 'No. 1 Grade':
                        fb_value = 11.0;
                        break;
                    case 'No. 2 Grade':
                        fb_value = 11.0;
                        break;
                    case 'No. 3 Grade':
                        fb_value = 7.0;
                        break;
                    default:
                        fb_value = 11.0;
                }
                break;
            case 'Spruce-Pine-Fir':
                switch (this.grade.name) {
                    case 'Select Structural':
                        fb_value = 16.5;
                        break;
                    case 'No. 1 Grade':
                        fb_value = 11.8;
                        break;
                    case 'No. 2 Grade':
                        fb_value = 11.8;
                        break;
                    case 'No. 3 Grade':
                        fb_value = 7.0;
                        break;
                    default:
                        fb_value = 11.8;
                }
                break;
            case 'Northern Specie':
                switch (this.grade.name) {
                    case 'Select Structural':
                        fb_value = 10.6;
                        break;
                    case 'No. 1 Grade':
                        fb_value = 7.6;
                        break;
                    case 'No. 2 Grade':
                        fb_value = 7.6;
                        break;
                    case 'No. 3 Grade':
                        fb_value = 4.5;
                        break;
                    default:
                        fb_value = 7.6;
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
                fv_value = 1.9;
                break;
            case 'Hem-Fir':
                fv_value = 1.6;
                break;
            case 'Spruce-Pine-Fir':
                fv_value = 1.5;
                break;
            case 'Northern Specie':
                fv_value = 1.3;
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
                        fc_value = 19.0;
                        break;
                    case 'No. 1 Grade':
                        fc_value = 14.0;
                        break;
                    case 'No. 2 Grade':
                        fc_value = 14.0;
                        break;
                    case 'No. 3 Grade':
                        fc_value = 7.3;
                        break;
                    default:
                        fc_value = 14.0;
                }
                break;
            case 'Hem-Fir':
                switch (this.grade.name) {
                    case 'Select Structural':
                        fc_value = 17.6;
                        break;
                    case 'No. 1 Grade':
                        fc_value = 14.8;
                        break;
                    case 'No. 2 Grade':
                        fc_value = 14.8;
                        break;
                    case 'No. 3 Grade':
                        fc_value = 9.2;
                        break;
                    default:
                        fc_value = 14.8;
                }
                break;
            case 'Spruce-Pine-Fir':
                switch (this.grade.name) {
                    case 'Select Structural':
                        fc_value = 14.5;
                        break;
                    case 'No. 1 Grade':
                        fc_value = 11.5;
                        break;
                    case 'No. 2 Grade':
                        fc_value = 11.5;
                        break;
                    case 'No. 3 Grade':
                        fc_value = 9.0;
                        break;
                    default:
                        fc_value = 11.5;
                }
                break;
            case 'Northern Specie':
                switch (this.grade.name) {
                    case 'Select Structural':
                        fc_value = 13.0;
                        break;
                    case 'No. 1 Grade':
                        fc_value = 10.4;
                        break;
                    case 'No. 2 Grade':
                        fc_value = 10.4;
                        break;
                    case 'No. 3 Grade':
                        fc_value = 5.2;
                        break;
                    default:
                        fc_value = 10.4;
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
                        ft_value = 10.6;
                        break;
                    case 'No. 1 Grade':
                        ft_value = 5.8;
                        break;
                    case 'No. 2 Grade':
                        ft_value = 5.8;
                        break;
                    case 'No. 3 Grade':
                        ft_value = 2.1;
                        break;
                    default:
                        ft_value = 5.8;
                }
                break;
            case 'Hem-Fir':
                switch (this.grade.name) {
                    case 'Select Structural':
                        ft_value = 9.7;
                        break;
                    case 'No. 1 Grade':
                        ft_value = 6.2;
                        break;
                    case 'No. 2 Grade':
                        ft_value = 6.2;
                        break;
                    case 'No. 3 Grade':
                        ft_value = 3.2;
                        break;
                    default:
                        ft_value = 6.2;
                }
                break;
            case 'Spruce-Pine-Fir':
                switch (this.grade.name) {
                    case 'Select Structural':
                        ft_value = 8.6;
                        break;
                    case 'No. 1 Grade':
                        ft_value = 5.5;
                        break;
                    case 'No. 2 Grade':
                        ft_value = 5.5;
                        break;
                    case 'No. 3 Grade':
                        ft_value = 3.2;
                        break;
                    default: 
                        ft_value = 5.5;
                }
                break;
            case 'Northern Specie':
                switch (this.grade.name) {
                    case 'Select Structural':
                        ft_value = 6.2;
                        break;
                    case 'No. 1 Grade':
                        ft_value = 4.0;
                        break;
                    case 'No. 2 Grade':
                        ft_value = 4.0;
                        break;
                    case 'No. 3 Grade':
                        ft_value = 2.0;
                        break;
                    default:
                        ft_value = 4.0;
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
                        E_value = 12500;
                        break;
                    case 'No. 1 Grade':
                        E_value = 11000;
                        break;
                    case 'No. 2 Grade':
                        E_value = 11000;
                        break;
                    case 'No. 3 Grade':
                        E_value = 10000;
                        break;
                    default: 
                        E_value = 11000;
                }
                break;
            case 'Hem-Fir':
                switch (this.grade.name) {
                    case 'Select Structural':
                        E_value = 12000;
                        break;
                    case 'No. 1 Grade':
                        E_value = 11000;
                        break;
                    case 'No. 2 Grade':
                        E_value = 11000;
                        break;
                    case 'No. 3 Grade':
                        E_value = 10000;
                        break;
                    default:
                        E_value = 11000;
                }
                break;
            case 'Spruce-Pine-Fir':
                switch (this.grade.name) {
                    case 'Select Structural':
                        E_value = 10500;
                        break;
                    case 'No. 1 Grade':
                        E_value = 9500;
                        break;
                    case 'No. 2 Grade':
                        E_value = 9500;
                        break;
                    case 'No. 3 Grade':
                        E_value = 9000;
                        break;
                    default:
                        E_value = 9500;
                }
                break;
            case 'Northern Specie':
                switch (this.grade.name) {
                    case 'Select Structural':
                        E_value = 7500;
                        break;
                    case 'No. 1 Grade':
                        E_value = 7000;
                        break;
                    case 'No. 2 Grade':
                        E_value = 7000;
                        break;
                    case 'No. 3 Grade':
                        E_value = 6500;
                        break;
                    default:
                        E_value = 7500;
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
                        E05_value = 8500;
                        break;
                    case 'No. 1 Grade':
                        E05_value = 7000;
                        break;
                    case 'No. 2 Grade':
                        E05_value = 7000;
                        break;
                    case 'No. 3 Grade':
                        E05_value = 5500;
                        break;
                    default:
                        E05_value = 7000;
                }
                break;
            case 'Hem-Fir':
                switch (this.grade.name) {
                    case 'Select Structural':
                        E05_value = 8500;
                        break;
                    case 'No. 1 Grade':
                        E05_value = 7500;
                        break;
                    case 'No. 2 Grade':
                        E05_value = 7500;
                        break;
                    case 'No. 3 Grade':
                        E05_value = 6000;
                        break;
                    default:
                        E05_value = 7500;
                }
                break;
            case 'Spruce-Pine-Fir':
                switch (this.grade.name) {
                    case 'Select Structural':
                        E05_value = 7500;
                        break;
                    case 'No. 1 Grade':
                        E05_value = 6500;
                        break;
                    case 'No. 2 Grade':
                        E05_value = 6500;
                        break;
                    case 'No. 3 Grade':
                        E05_value = 5500;
                        break;
                    default:
                        E05_value = 6500;
                }
                break;
            case 'Northern Specie':
                switch (this.grade.name) {
                    case 'Select Structural':
                        E05_value = 5500;
                        break;
                    case 'No. 1 Grade':
                        E05_value = 5000;
                        break;
                    case 'No. 2 Grade':
                        E05_value = 5000;
                        break;
                    case 'No. 3 Grade':
                        E05_value = 4000;
                        break;
                    default:
                        E05_value = 5000;
                }
                break;
            default:
                E05_value = 0;
        }
        return E05_value;
    }


}

export default SawnLumber;