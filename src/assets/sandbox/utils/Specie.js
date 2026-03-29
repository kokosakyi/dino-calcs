
class Specie {
    constructor(selectedSpecie) {
        this.species = [{
                abbreviation: 'D Fir-L',
                name: 'Douglas Fir-Larch'
            },
            {
                abbreviation: 'Hem-Fir',
                name: 'Hem-Fir',
            },
            {
                abbreviation: 'S-P-F',
                name: 'Spruce-Pine-Fir'
            },
            {
                abbreviation: 'North',
                name: 'Northern Specie'
            }
        ]
        this.selectedSpecie = selectedSpecie;

    }

    getSpecies() {
        return this.species;
    }

    getSelectedSpecie() {
        const selSpecie = this.species.filter(specie => specie.name === this.selectedSpecie)[0];
        return selSpecie;
    }

}

export default Specie;