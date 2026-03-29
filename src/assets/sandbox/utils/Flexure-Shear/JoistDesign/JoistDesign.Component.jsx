import React, { useState, Fragment, useEffect } from 'react';

import Specie from './../../../../Utils/Specie';
import SawnLumber from './../../../../Utils/SawnLumber';
import Grade from './../../../../Utils/Grade';
import ModificationFactors from './../../../../Utils/ModificationFactors';
import { sections } from './../../../../Utils/lumberSectionProperties';

import 'katex/dist/katex.min.css';
import Tex from '@matejmazur/react-katex';

import Modal from './../../../Modal/Modal.Component';

// Info Components
import Info from './../../../Info/Info';

const JoistDesign = () => {

    const [modalState, setModalState] = useState(false);
    const [additionalInfo, setAdditionalInfo] = useState('');
    const [KL, setKL] = useState(0);

    const species = new Specie().getSpecies().map(specie => specie.name);
    const grades = new Grade().getGrades().map(grade => grade.name);
    const loadDurations = ['Short Term', 'Standard Term', 'Long Term'];
    const serviceConditions = ['Dry', 'Wet'];
    const systemConditions = ['Case 1', 'Case 2'];
    const treatmentConditions = ['Untreated', 'Treated-Incised'];
    const phi_b = 0.9;
    const phi_v = 0.9;
    const phi_cp = 0.8;
    
    const [formData, setFormData] = useState({
        factoredLoading: '',
        serviceLoading: '',
        joistSpacing: '',
        joistSpan: '',
        bearingLength: '',
        unsupportedLength: '',
        formSubmitted: false,
        specie: 'Spruce-Pine-Fir',
        grade: 'No. 1 Grade',
        sectionProperties: '38 x 89',
        loadDurationCondition: 'Standard Term',
        serviceCondition: 'Dry',
        systemCondition: 'Case 1',
        treatmentCondition: 'Untreated'
    });

    const [computedValues, setComputedValues] = useState({
        b: 38,
        d: 89,
        fb: 0,
        fv: 0,
        fcp: 0,
        E: 0,
        KD: 0,
        KH: 0,
        KSb: 0,
        KSv: 0,
        KScp: 0,
        KSE: 0,
        KT: 0,
        KZb: 0,
        KZv: 0,
        KZcp: 0,
        KB: 1.0,
        Lu: 0,
        Le: 0
    });

    const [results, setResults] = useState({
        Fb: 0,
        S: 0,
        Mr: 0,
        Fv: 0,
        An: 0,
        Vr: 0,
        ln: 0,
        Mf: 0,
        Vf: 0,
        Qf: 0,
        Qr: 0,
        delta_Limit: 0,
        I: 0,
        EsI: 0,
        delta: 0,
        CB: 0,
        CK: 0
    });

    const [capacityChecks, setCapacityChecks] = useState({
        shearCheck: 0,
        bendingCheck: 0,
        deflectionCheck: 0,
        bearingCheck: 0,
        
    });

    const {
        factoredLoading,
        serviceLoading,
        joistSpacing,
        joistSpan,
        bearingLength,
        unsupportedLength,
        formSubmitted,
        specie,
        grade,
        sectionProperties,
        loadDurationCondition,
        serviceCondition,
        systemCondition,
        treatmentCondition,
     
    } = formData;

    const {
        b, 
        d,
        fb,
        fv,
        fcp,
        E,
        KD,
        KH,
        KSb,
        KSv,
        KScp,
        KSE,
        KT,
        KZb,
        KZv,
        KZcp,
        KB,
        Lu,
        Le
    } = computedValues;

    const {
        Fb, S, Mr, Fv, An, Vr,  ln, Mf, Vf, Qf, Qr, delta_Limit, I, EsI, delta, CB, CK
    } = results;

    const { shearCheck, bendingCheck, deflectionCheck, bearingCheck } = capacityChecks;

    useEffect(()=> {
        const sawnLumber = new SawnLumber(specie, grade);
        const positionOfX = sectionProperties.indexOf('x');
        const breadth = sectionProperties.substring(0, positionOfX);
        const depth = sectionProperties.substring(positionOfX + 1);
        setComputedValues({
            ...computedValues,
            b: breadth,
            d: depth,
            E: sawnLumber.E(),
            fb: sawnLumber.fb(),
            fv: sawnLumber.fv(),
            fcp: sawnLumber.fcp(),
            KD: ModificationFactors.KD(loadDurationCondition),
            KSb: ModificationFactors.KS('KSb', serviceCondition, breadth),
            KSv: ModificationFactors.KS('KSv', serviceCondition, breadth),
            KScp: ModificationFactors.KS('KScp', serviceCondition, breadth),
            KSE: ModificationFactors.KS('KSE', serviceCondition, breadth),
            KH: ModificationFactors.KH(systemCondition, 'KHb', 'visual'),
            KT: ModificationFactors.KT(treatmentCondition, serviceCondition),
            KZb: ModificationFactors.KZ(breadth, depth, 'KZb'),
            KZv: ModificationFactors.KZ(breadth, depth, 'KZv'), 
            KZcp: ModificationFactors.KZ(breadth, depth, 'KZcp'),
            Lu: unsupportedLength * 1,
            Le: 1.92 * unsupportedLength
        });
    }, [formData]);

    useEffect(()=> {
        setKL(computeKL(1.92 * unsupportedLength));
    }, [Le]);

    useEffect(()=> {
        setResults({
            ...results,
            // Factored Loading
            ln: joistSpan,
            Mf: (((factoredLoading * joistSpacing * (joistSpan ** 2))) / 8) * (10 ** -9), 
            Vf: (0.5 * (factoredLoading * joistSpacing * joistSpan)) * (1 - ((2 * d)/ joistSpan)) * (10 ** -6),
            Qf: (0.5 * factoredLoading * joistSpacing * joistSpan) * (10 ** -6),
            //Factored Resistance
            Fb: fb * (KD * KH * KSb * KT),
            S: (b * (d ** 2)) /6,
            Mr: (phi_b * fb * (KD * KH * KSb * KT) * S * KZb * KL) / (10 ** 6),
            Fv: fv * (KD * KH * KSv * KT),
            Qr: (phi_cp * fcp * KD * KScp * KT) * (b * bearingLength) * KB * KZcp * ( 10 ** -3),
            An: b * d,
            Vr: (phi_v * fv * (KD * KH * KSv * KT) * ((2/3)* (An)) * KZv) / (10 ** 3),
            delta_Limit: (joistSpan - bearingLength) / 360,
            I: (b * (d ** 3)) /12,
            EsI: E * (KSE * KT) * ((b * (d ** 3)) /12),
            delta: ((5 * (serviceLoading * joistSpacing) * (joistSpan ** 4)) / (384 * E * (KSE * KT) * ((b * (d ** 3)) /12))) * ( 10 ** -3),
            CB: Math.sqrt((Le * d) / (b ** 2)),
            CK: Math.sqrt((0.97 * E * KSE * KT) / (fb * (KD * KH * KSb * KT)))
        });
    }, [computedValues, KL]);

    useEffect(()=> {
        setCapacityChecks({
            ...capacityChecks,
            shearCheck: Vf / Vr,
            bendingCheck: Mf / Mr,
            deflectionCheck: delta / delta_Limit,
            bearingCheck: Qf / Qr
        })
    }, [results]);

    const onChange =  e => {
        const regexp = /^[-+]?\d*\.?\d*$/;
        const numericInputs = ['factoredLoading', 'joistSpacing', 'joistSpan', 'bearingLength', 'unsupportedLength'];
        if (numericInputs.indexOf(e.target.name) > -1) {
            if (e.target.value ==='' || regexp.test(e.target.value)) {
                setFormData({
                    ...formData,
                    [e.target.name]: e.target.value,
                    formSubmitted: false
                });
            }
        }
        else {
            setFormData({
                ...formData,
                [e.target.name]: e.target.value,
                formSubmitted: false
            });
        }
    } 

    const handleFormSubmit = e => {
        e.preventDefault();
        setFormData({
            ...formData,
            formSubmitted: true
        });
    }

    const unloadModal = () => {
        setModalState(false);
    }

    const computeKL = (_le)=> {
        const _CB = Math.sqrt((_le * d) / (b ** 2));
        const _CK = Math.sqrt((0.97 * E * KSE * KT) / (fb * (KD * KH * KSb * KT)));
        if (_CB <= 10) {
            return 1;
        }
        else if (_CB <= 20) {
            return 1 - (1/3) * Math.pow((_CB / _CK), 4);
        }
        else {
            return (0.65 * E * KSE * KT) / ( (_CB**2) * Fb );
        }
        return 1;
    }

    const handleSectionPropertiesInfo = (e)=> {
        e.preventDefault();
        setAdditionalInfo((
            <Fragment>
                <p>
                    Solid sawn wood, less than 89 mm in thickness, is referred to as dimension lumber.
                </p>
                <p>
                    The thicknesses of sawn lumber joists range from 38 mm to 89 mm with depths 89 mm to 286 mm.
                </p>
                <p>
                    Joists usually span up to approximately 7m.
                </p>
            </Fragment>
        ))
        setModalState(true);
    }

    const handleSpecieInfo = (e)=> {
        e.preventDefault();
        setAdditionalInfo((
            <Fragment>
                <p>Wood species of similar strength characteristics are grouped or combined together to form a species group, whose members are grown and harvested together.</p>
                <p>Ex. Spruce-Pine-Fir is a species group comprising of Spruce, Pines and Fir commonly grown in Canada.</p>
            </Fragment>
        ))
        setModalState(true);
    }

    const handleGradeInfo = (e)=> {
        e.preventDefault();
        setAdditionalInfo((
            <Fragment>
                <p>Lumber is visually and mechanically stress graded.</p>
                <p>Lumber of a higher stress grade is stronger and usually more expensive</p>
                <p>Visual stress grading is carried out by a licensed grader who assigns strength properties based
                    on the number and location of identified defects while mechanical stress grading involve non-destructive
                    tests carried out by machines in order to assign strength properties.
                </p>
            </Fragment>
        ))
        setModalState(true);
    }

    return (
        <Fragment>
            {modalState && (<Modal modalState={modalState} unloadModal={unloadModal}><Info>{additionalInfo}</Info></Modal>)}
            <div className="main-info-column">
                <h1>Joist Design</h1>
                <form onSubmit={handleFormSubmit} >
                    <div className="form-group">
                        <label htmlFor="factoredLoading">Factored Loading (in kPa)</label>
                        <input
                            name="factoredLoading"
                            value={factoredLoading} 
                            onChange={e => onChange(e)}
                            type="text" 
                            placeholder="Factored Loading" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="serviceLoading">Service Loading (in kPa)</label>
                        <input
                            name="serviceLoading"
                            value={serviceLoading} 
                            onChange={e => onChange(e)}
                            type="text" 
                            placeholder="Service Loading" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="joistSpacing">Joist Spacing (mm)</label>
                        <input
                            name="joistSpacing"
                            value={joistSpacing} 
                            onChange={e => onChange(e)}
                            type="text" 
                            placeholder="Joist Spacing" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="joistSpan">Joist Span (mm)</label>
                        <input
                            name="joistSpan"
                            value={joistSpan} 
                            onChange={e => onChange(e)}
                            type="text" 
                            placeholder="Joist Span" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="unsupportedLength">Unsupported Length (mm)</label>
                        <input
                            name="unsupportedLength"
                            value={unsupportedLength} 
                            onChange={e => onChange(e)}
                            type="text" 
                            placeholder="Unsupported Length" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="bearingLength">Bearing Length (mm)</label>
                        <input
                            name="bearingLength"
                            value={bearingLength} 
                            onChange={e => onChange(e)}
                            type="text" 
                            placeholder="Bearing Length" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="sectionProperties">Section Properties <span><button onClick={handleSectionPropertiesInfo} className="info-button">i</button></span></label>
                        <select
                            name="sectionProperties"
                            value={sectionProperties}
                            onChange={e => onChange(e)}>
                                { sections.map((option, index)=> <option key={index}>{option}</option>) }
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="specie">Specie <span><button onClick={handleSpecieInfo} className="info-button">i</button></span></label>
                        <select
                            name="specie"
                            value={specie}
                            onChange={e => onChange(e)}>
                                { species.map((option, index)=> <option key={index}>{option}</option>) }
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="grade">Grade <span><button onClick={handleGradeInfo} className="info-button">i</button></span></label>
                        <select
                            name="grade"
                            value={grade}
                            onChange={e => onChange(e)}>
                                { grades.map((option, index)=> <option key={index}>{option}</option>) }
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="loadDurationCondition">Load Duration</label>
                        <select
                            name="loadDurationCondition"
                            value={loadDurationCondition}
                            onChange={e => onChange(e)}>
                                { loadDurations.map((option, index)=> <option key={index}>{option}</option>) }
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="serviceCondition">Service Condition</label>
                        <select
                            name="serviceCondition"
                            value={serviceCondition}
                            onChange={e => onChange(e)}>
                                { serviceConditions.map((option, index)=> <option key={index}>{option}</option>) }
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="systemCondition">System Condition</label>
                        <select
                            name="systemCondition"
                            value={systemCondition}
                            onChange={e => onChange(e)}>
                                { systemConditions.map((option, index)=> <option key={index}>{option}</option>) }
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="treatmentCondition">Treatment Condition</label>
                        <select
                            name="treatmentCondition"
                            value={treatmentCondition}
                            onChange={e => onChange(e)}>
                                { treatmentConditions.map((option, index)=> <option key={index}>{option}</option>) }
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary">Submit</button>
                </form>
                { formSubmitted &&  (
                   <div>
                       <div className="info-card info-card-primary">
                            <div className="card-body">
                                <div className="card-title">
                                    Input Values
                                </div>
                                <div className="card-text">
                                    <p>Specie: {specie}</p>
                                    <p>Grade: {grade}</p>
                                    <p><Tex>{`b = ${b} \\text{ mm}`}</Tex><span className="ml-2"> cross-sectional width</span></p>
                                    <p><Tex>{`d = ${d} \\text{ mm}`}</Tex><span className="ml-2"> cross-sectional depth</span></p>
                                    <p>Load Duration: {loadDurationCondition}</p>
                                    <p>Service Condition: {serviceCondition}</p>
                                    <p>System Condition: {systemCondition}</p>
                                    <p>Treatment Condition: {treatmentCondition}</p>
                                </div>
                            </div>
                        </div>

                        <div className="info-card info-card-primary">
                            <div className="card-body">
                                <div className="card-title">
                                    Factored Loading
                                </div>
                                <div className="card-text">
                                    <p><Tex>{`l_n = \\text{ joist span } - \\text{ bearing length }`}</Tex></p>
                                    <p><Tex>{`l_n = ${ln} \\text{ mm }`}</Tex></p>
                                    <p><Tex>{`M_f = \\dfrac{\\text{ factored loading } \\times \\text{ joist spacing } \\times l_n^2}{8}  `}</Tex></p>
                                    <p><Tex>{`M_f = ${Mf.toFixed(2)} \\text{ kN-m }`}</Tex></p>
                                    <p><Tex>{`V_f = \\dfrac{\\text{ factored loading } \\times \\text{ joist spacing } \\times l_n}{2} \\times \\Big( 1 - \\dfrac{2 \\times d}{l_n} \\Big)  `}</Tex></p>
                                    <p><Tex>{`V_f = ${Vf.toFixed(2)} \\text{ kN }`}</Tex></p>
                                    <p><Tex>{`Q_f = \\dfrac{\\text{ factored loading } \\times \\text{ joist spacing } \\times l_n}{2}  `}</Tex></p>
                                    <p><Tex>{`Q_f = ${Qf.toFixed(2)} \\text{ kN }`}</Tex></p>
                                </div>
                            </div>
                        </div>

                        <div className="info-card info-card-primary">
                            <div className="card-body">
                                <div className="card-title">
                                    Resistance Factors
                                </div>
                                <div className="card-text">
                                    <p><Tex>{`\\phi_b=${phi_b}`}</Tex><span className="ml-3"> resistance factor for bending, CSA 086 Cl. 6.5.4.1</span></p>
                                    <p><Tex>{`\\phi_v=${phi_v}`}</Tex><span className="ml-3"> resistance factor for shear, CSA 086 Cl. 6.5.5.2</span></p>
                                    <p><Tex>{`\\phi_{cp}=${phi_cp}`}</Tex><span className="ml-3"> resistance factor for compression perpendicular to grain, CSA 086 Cl. 6.5.7.2</span></p>
                                </div>
                            </div>
                        </div>
                        <div className="info-card info-card-primary">
                            <div className="card-body">
                                <div className="card-title">
                                    Specified Strength Values (CSA 086 Table 6.3.1A)
                                </div>
                                <div className="card-text">
                                    <p><Tex>{`f_b = ${fb}  \\text{ MPa}`}</Tex><span className="ml-3">specified strength in bending</span></p>
                                    <p><Tex>{`f_v = ${fv}  \\text{ MPa}`}</Tex><span className="ml-3">specified strength in shear</span></p>
                                    <p><Tex>{`f_{cp} = ${fcp}  \\text{ MPa}`}</Tex><span className="ml-3">specified strength in compression, perpendicular to grain</span></p>
                                </div>
                            </div>
                        </div>
                        <div className="info-card info-card-primary">
                            <div className="card-body">
                                <div className="card-title">
                                    Modulus OF Elasticity
                                </div>
                                <div className="card-text">
                                    <p><Tex>{`E = ${E}  \\text{ MPa}`}</Tex><span className="ml-3">CSA 086 Table 6.3.1A</span></p>
                                </div>
                            </div>
                        </div>
                        <div className="info-card info-card-primary">
                            <div className="card-body">
                                <div className="card-title">
                                    Load Duration Factor ( {loadDurationCondition} )
                                </div>
                                <div className="card-text">
                                    <p><Tex>{`K_D = ${KD.toFixed(2)}`}</Tex><span className="ml-3">CSA 086 Table 5.3.2.2</span></p>
                                </div>
                            </div>
                        </div>
                        <div className="info-card info-card-primary">
                            <div className="card-body">
                                <div className="card-title">
                                    System Factor: {systemCondition}
                                </div>
                                <div className="card-text">
                                    <p><Tex>{`K_H = ${KH.toFixed(2)}`}</Tex><span className="ml-3">CSA 086 Cl. 6.4.4</span></p>
                                </div>
                            </div>
                        </div>
                        <div className="info-card info-card-primary">
                            <div className="card-body">
                                <div className="card-title">
                                    Service Condition Factors - {serviceCondition} Condition - (CSA 086 Table 6.4.2)
                                </div>
                                <div className="card-text">
                                    <p><Tex>{`K_{Sb} = ${KSb.toFixed(2)}`}</Tex><span className="ml-3">for bending</span></p>
                                    <p><Tex>{`K_{Sv} = ${KSv.toFixed(2)}`}</Tex><span className="ml-3">for shear</span></p>
                                    <p><Tex>{`K_{Scp} = ${KScp.toFixed(2)}`}</Tex><span className="ml-3">for compression perpendicular to grain</span></p>
                                    <p><Tex>{`K_{SE} = ${KSE.toFixed(2)}`}</Tex><span className="ml-3">for compression modulus of elasticity</span></p>
                                </div>
                            </div>
                        </div>
                        <div className="info-card info-card-primary">
                            <div className="card-body">
                                <div className="card-title">
                                    Treatment Factor - { treatmentCondition }
                                </div>
                                <div className="card-text">
                                   <p><Tex>{`K_T = ${KT.toFixed(2)}`}</Tex><span className="ml-3">CSA 086 Table 6.4.3</span></p> 
                                </div>
                            </div>
                        </div>
                        <div className="info-card info-card-primary">
                            <div className="card-body">
                                <div className="card-title">
                                    Size Factor (CSA 086 Table 6.4.5)
                                </div>
                                <div className="card-text">
                                    <p><Tex>{`K_{Zb} = ${KZb.toFixed(2)}`}</Tex><span className="ml-3">for bending</span></p>
                                    <p><Tex>{`K_{Zv} = ${KZv.toFixed(2)}`}</Tex><span className="ml-3">for shear</span></p>
                                </div>
                            </div>
                        </div>
                        <div className="info-card info-card-primary">
                            <div className="card-body">
                                <div className="card-title">
                                    Lateral Stability Factor (CSA 086 Cl. 6.5.4.2 & Cl. 7.5.6.4)
                                </div>
                                <div className="card-text">
                                    <p><Tex>{`l_u = ${Lu}`}</Tex><span className='ml-3'>unsupported length</span></p>
                                    <p><Tex>{`L_e = 1.92 \\cdot l_u`}</Tex><span className='ml-3'>Effective length</span></p>
                                    <p><Tex>{`L_e = ${Le.toFixed(2)}`}</Tex></p>
                                    <p><Tex>{`C_B = \\sqrt{\\dfrac{L_e \\cdot d}{b^2}}`}</Tex></p>
                                    <p><Tex>{`C_B = ${CB.toFixed(2)}`}</Tex></p>
                                    <p><Tex>{`C_K = \\sqrt{\\dfrac{0.97 \\cdot E \\cdot K_{SE} \\cdot K_T}{F_b}}`}</Tex></p>
                                    <p><Tex>{`C_K = ${CK.toFixed(2)}`}</Tex></p>
                                    <p><Tex>{`\\text{ For } C_B \\leq 10`}</Tex></p>
                                    <p><Tex>{`\\implies K_L = 1.0`}</Tex></p>
                                    <p><Tex>{`\\text{ For } 10 < C_B \\leq 20`}</Tex></p>
                                    <p><Tex>{`\\implies K_L = 1 - \\dfrac{1}{3} \\cdot \\Big( \\dfrac{C_B}{C_K} \\Big)^4`}</Tex></p>
                                    <p><Tex>{`\\text{ For } C_B \\geq 20 `}</Tex></p>
                                    <p><Tex>{`\\implies K_L = \\Big( \\dfrac{0.65 \\cdot E \\cdot K_{SE} \\cdot K_T }{ {C_B}^2 \\cdot F_b } \\Big)`}</Tex></p>
                                    <p><Tex>{`K_{L} = ${KL.toFixed(2)}`}</Tex></p>
                                </div>
                            </div>
                        </div>
                        <div className="info-card info-card-primary">
                            <div className="card-body">
                                <div className="card-title">
                                    Section Modulus
                                </div>
                                <div className="card-text">
                                    <p><Tex>{`S =  \\dfrac{b \\cdot d^2}{6}`}</Tex></p>
                                    <p><Tex>{`S = ${S.toFixed(0)} \\text{ mm}^2`}</Tex></p>
                                </div>
                            </div>
                        </div>
                        <div className="info-card info-card-primary">
                            <div className="card-body">
                                <div className="card-title">
                                    Bending Resistance (CSA 086 Cl. 6.5.4.1)
                                </div>
                                <div className="card-text">
                                    <p><Tex>{`F_b = f_b \\cdot K_D \\cdot K_H \\cdot K_{Sb} \\cdot K_T`}</Tex></p>
                                    <p><Tex>{`F_b = ${Fb.toFixed(2)} \\text{ MPa}`}</Tex></p>
                                    <p><Tex>{`M_r = \\phi_b \\cdot F_b \\cdot S \\cdot K_{Zb}  \\cdot K_L `}</Tex></p>
                                    <p><Tex>{`M_r = ${Mr.toFixed(2)} \\text{ kNm}`}</Tex></p>
                                </div>
                            </div>
                        </div>
                        <div className="info-card info-card-primary">
                            <div className="card-body">
                                <div className="card-title">
                                    Shear Resistance (CSA 086 Cl. 6.5.5.2)
                                </div>
                                <div className="card-text">
                                    <p><Tex>{`F_v = f_v \\cdot K_D \\cdot K_H \\cdot K_{Sv} \\cdot K_T`}</Tex></p>
                                    <p><Tex>{`F_v = ${Fv.toFixed(2)} \\text{ MPa}`}</Tex></p>
                                    <p><Tex>{`V_r = \\phi_v \\cdot F_v \\cdot (\\frac{2}{3} \\cdot A_n) \\cdot K_{Zv}  `}</Tex></p>
                                    <p><Tex>{`V_r = ${Vr.toFixed(2)} \\text{ kN}`}</Tex></p>
                                </div>
                            </div>
                        </div>
                        <div className="info-card info-card-primary">
                            <div className="card-body">
                                <div className="card-title">
                                    Bearing Resistance (CSA 086 Cl. 6.5.7.2)
                                </div>
                                <div className="card-text">
                                    <p><Tex>{`Q_r = \\phi_{cp} \\cdot F_{cp} \\cdot (K_D \\cdot K_{Sp} \\cdot K_T) \\cdot A_b \\cdot K_B \\cdot K_{Zcp}  `}</Tex></p>
                                    <p><Tex>{`Q_r = ${Qr.toFixed(2)} \\text{ kN}`}</Tex></p>
                                </div>
                            </div>
                        </div>
                        <div className="info-card info-card-primary">
                            <div className="card-body">
                                <div className="card-title">
                                    Capacity Checks
                                </div>
                                <div className="card-text">
                                    <p>Moment Capacity Check</p>
                                    <p><Tex>{`M_f = ${Mf.toFixed(2)} \\text{ kN-m }`}</Tex></p>
                                    <p><Tex>{`M_r = ${Mr.toFixed(2)} \\text{ kNm} `}</Tex></p>
                                    <p className={bendingCheck >= 1 ? 'text-danger' : 'text-success'}>
                                        <Tex>{`DC_{ratio} = ${bendingCheck.toFixed(2)} `}</Tex>
                                        {
                                            bendingCheck >=1 ? (
                                                <span className="text-danger">  NOT OK</span>
                                            ): 
                                            (
                                                <span className="text-success"> OK</span>
                                            )
                                        }
                                    </p>
                                    <p>Shear Capacity Check</p>
                                    <p><Tex>{`V_f = ${Vf.toFixed(2)} \\text{ kN }`}</Tex></p>
                                    <p><Tex>{`V_r = ${Vr.toFixed(2)} \\text{ kN}`}</Tex></p>
                                    <p className={shearCheck >= 1 ? 'text-danger' : 'text-success'}>
                                        <Tex>{`DC_{ratio} = ${shearCheck.toFixed(2)}`}</Tex>
                                        {
                                            shearCheck >=1 ? (
                                                <span className="text-danger">  NOT OK</span>
                                            ): 
                                            (
                                                <span className="text-success"> OK</span>
                                            )
                                        }
                                    </p>
                                    <p>Bearing Capacity Check</p>
                                    <p><Tex>{`Q_f = ${Qf.toFixed(2)} \\text{ kN }`}</Tex></p>
                                    <p><Tex>{`Q_r = ${Qr.toFixed(2)} \\text{ kN}`}</Tex></p>
                                    <p className={bearingCheck >= 1 ? 'text-danger' : 'text-success'}>
                                        <Tex>{`DC_{ratio} = ${bearingCheck.toFixed(2)}`}</Tex>
                                        {
                                            bearingCheck >=1 ? (
                                                <span className="text-danger">  NOT OK</span>
                                            ): 
                                            (
                                                <span className="text-success"> OK</span>
                                            )
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="info-card info-card-primary">
                            <div className="card-body">
                                <div className="card-title">
                                    Deflection Check
                                </div>
                                <div className="card-text">
                                    <p><Tex>{`\\delta_{limit} = \\dfrac{ln}{360} `}</Tex></p>
                                    <p><Tex>{`\\delta_{limit} = ${delta_Limit.toFixed(2)} \\text{ mm}`}</Tex></p>
                                    <p><Tex>{`I = \\dfrac{b \\times d^3}{12} `}</Tex></p>
                                    <p><Tex>{`I = ${I.toExponential(2)} \\text{ mm}^4 `}</Tex></p>
                                    <p><Tex>{`E{_s}I = E \\times (K_{SE} \\times K_T) \\times I `}</Tex></p>
                                    <p><Tex>{`E{_s}I =  ${EsI.toExponential(2)} \\text{ N} \\cdot \\text{mm}^2`}</Tex></p>
                                    <p><Tex>{`\\Delta = \\dfrac{ 5 \\times \\text{service load} \\times \\text{joist spacing} \\times l_{n}^4 }{ 384 \\times E_s \\times I}`}</Tex></p>
                                    <p><Tex>{`\\Delta = ${delta.toFixed(2)} \\text{ mm}`}</Tex></p>
                                    <p>Deflection Capacity Check</p>
                                    <p className={deflectionCheck >= 1 ? 'text-danger' : 'text-success'}>
                                        <Tex>{`DC_{ratio} = ${deflectionCheck.toFixed(2)}`}</Tex>
                                        {
                                            deflectionCheck >=1 ? (
                                                <span className="text-danger">  NOT OK</span>
                                            ): 
                                            (
                                                <span className="text-success"> OK</span>
                                            )
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div> 
                )}
            </div>
            
            
        </Fragment>
    )
}

export default JoistDesign;
