import React, { useState, Fragment, useEffect } from 'react';

import Specie from './../../../../Utils/Specie';
import SawnTimber from './../../../../Utils/SawnTimber';
import Grade from './../../../../Utils/Grade';
import ModificationFactors from './../../../../Utils/ModificationFactors';
import Sections from './../../../../Utils/timberSectionProperties';

import 'katex/dist/katex.min.css';
import Tex from '@matejmazur/react-katex';

import Modal from './../../../Modal/Modal.Component';

// Info Components
import Info from './../../../Info/Info';

const SawnTimberBeam = () => {
    const [modalState, setModalState] = useState(false);
    const [hasNotch, setHasNotch] = useState(false);
    const [additionalInfo, setAdditionalInfo] = useState('');
    const [sections, setSections] = useState(Sections('Douglas Fir-Larch'));
    const species = new Specie().getSpecies().map(specie => specie.name);
    const grades = new Grade()
        .getGrades()
        .map(grade => grade.name)
        .filter(grade => grade !== 'No. 3 Grade');
    const loadDurations = ['Short Term', 'Standard Term', 'Long Term'];
    const serviceConditions = ['Dry', 'Wet'];
    const treatmentConditions = ['Untreated', 'Treated-Incised'];
    const phi_b = 0.9;
    const phi_v = 0.9;
    const phi_cp = 0.8;
    const phi_f = 0.9;

    const [KL, setKL] = useState(0);
    const [alpha, setAlpha] = useState(0);
    const [eta, setEta] = useState(0);
    const [KN, setKN] = useState(0);

    const [formData, setFormData] = useState({
        factoredLoading: 0,
        serviceLoading: 0,
        tributaryWidth: 0,
        beamSpan: 0,
        bearingLength: 0,
        notchDepth: 0,
        unsupportedLength: 0,
        formSubmitted: false,
        specie: 'Douglas Fir-Larch',
        grade: 'No. 1 Grade',
        sectionProperties: '140 x 140',
        loadDurationCondition: 'Standard Term',
        serviceCondition: 'Dry',
        treatmentCondition: 'Untreated'
    });

    const [computedValues, setComputedValues] = useState({
        b: 38,
        d: 89,
        dn: 0,
        fb: 0,
        fv: 0,
        fcp: 0,
        ff: 0.5,
        E: 0,
        KD: 0,
        KH: 0,
        KSb: 0,
        KSv: 0,
        KScp: 0,
        KSE: 0,
        KSf: 0,
        KT: 0,
        KZb: 0,
        KZv: 0,
        KZcp: 0,
        KB: 1.0,
        Lu: 0,
        Le: 0,
        e: 0,
    });

    const [results, setResults] = useState({
        Fb: 0,
        Ff: 0,
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
        shearFractureCheck: 0
    });

    const {
        factoredLoading,
        serviceLoading,
        tributaryWidth,
        beamSpan,
        bearingLength,
        notchDepth,
        unsupportedLength,
        formSubmitted,
        specie,
        grade,
        sectionProperties,
        loadDurationCondition,
        serviceCondition,
        systemCondition,
        treatmentCondition
    } = formData;

    const {
        b,
        d,
        dn,
        fb,
        fv,
        ff,
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
        KSf,
        KB,
        Lu,
        Le,
        e
    } = computedValues;

    const {
        Fb, Ff, Fr, S, Mr, Fv, An, Vr, ln, Mf, Vf, Qf, Qr, delta_Limit, I, EsI, delta, CB, CK
    } = results;

    const { shearCheck, bendingCheck, deflectionCheck, bearingCheck, shearFractureCheck } = capacityChecks;

    useEffect(()=> {
        setSections(Sections(specie));
    }, [specie]);

    useEffect(() => {
        const sawnTimber = new SawnTimber(specie, grade);
        const positionOfX = sectionProperties.indexOf('x');
        const breadth = sectionProperties.substring(0, positionOfX);
        const depth = sectionProperties.substring(positionOfX + 1);
        setComputedValues({
            ...computedValues,
            b: parseFloat(breadth),
            d: parseFloat(depth),
            dn: Math.min(parseFloat(notchDepth), 0.25 * parseFloat(depth)),
            E: sawnTimber.E(),
            fb: sawnTimber.fb(),
            fv: sawnTimber.fv(),
            fcp: sawnTimber.fcp(),
            KD: ModificationFactors.KD(loadDurationCondition),
            KSb: ModificationFactors.KS('KSb', serviceCondition, breadth),
            KSv: ModificationFactors.KS('KSv', serviceCondition, breadth),
            KSf: ModificationFactors.KS('KSf', serviceCondition, breadth),
            KScp: ModificationFactors.KS('KScp', serviceCondition, breadth),
            KSE: ModificationFactors.KS('KSE', serviceCondition, breadth),
            KH: 1.0,
            KT: ModificationFactors.KT(treatmentCondition, serviceCondition),
            KZb: ModificationFactors.KZ(breadth, depth, 'KZb'),
            KZv: ModificationFactors.KZ(breadth, depth, 'KZv'),
            KZcp: ModificationFactors.KZ(breadth, depth, 'KZcp'),
            Lu: unsupportedLength * 1,
            Le: 1.92 * unsupportedLength,
            e: (parseFloat(bearingLength) / 2) + 2
        });
    }, [formData]);

    useEffect(() => {
        setAlpha(1 - (dn / d));
    }, [d, dn]);

    useEffect(() => {
        setEta(e / d);
    }, [e, d]);

    useEffect(() => {
        setKN(computeKN(alpha, eta));
    }, [alpha, eta]);

    useEffect(() => {
        setKL(computeKL(Le));
    }, [Le]);

    useEffect(() => {
        setResults({
            ...results,
            // Factored Loading
            ln: beamSpan,
            Mf: (((factoredLoading * tributaryWidth * (beamSpan ** 2))) / 8) * (10 ** -9),
            Vf: (0.5 * (factoredLoading * tributaryWidth * beamSpan)) * (1 - (((d - dn) + d) / beamSpan)) * (10 ** -6),
            Qf: (0.5 * factoredLoading * tributaryWidth * beamSpan) * (10 ** -6),
            //Factored Resistance
            Fb: fb * (KD * KH * KSb * KT),
            S: (b * (d ** 2)) / 6,
            Mr: (phi_b * fb * (KD * KH * KSb * KT) * S * KZb * KL) / (10 ** 6),
            Fv: fv * (KD * KH * KSv * KT),
            Qr: (phi_cp * fcp * KD * KScp * KT) * (b * bearingLength) * KB * KZcp * (10 ** -3),
            An: b * (d - dn),
            Vr: (phi_v * fv * (KD * KH * KSv * KT) * ((2 / 3) * (An)) * KZv) / (10 ** 3),
            Ff: ff * (KD * KH * KSf * KT),
            Fr: phi_f * (ff * (KD * KH * KSf * KT)) * (b * d) * KN * (10 ** -3),
            delta_Limit: (beamSpan - bearingLength) / 360,
            I: (b * (d ** 3)) / 12,
            EsI: E * (KSE * KT) * ((b * (d ** 3)) / 12),
            delta: ((5 * (serviceLoading * tributaryWidth) * (beamSpan ** 4)) / (384 * E * (KSE * KT) * ((b * (d ** 3)) / 12))) * (10 ** -3),
            CB: Math.sqrt((Le * d) / (b ** 2)),
            CK: Math.sqrt((0.97 * E * KSE * KT) / (fb * (KD * KH * KSb * KT)))
        });
    }, [computedValues, KL, KN]);

    useEffect(() => {
        setCapacityChecks({
            ...capacityChecks,
            shearCheck: Vf / Vr,
            bendingCheck: Mf / Mr,
            deflectionCheck: delta / delta_Limit,
            bearingCheck: Qf / Qr,
            shearFractureCheck: Qf / Fr
        })
    }, [results]);

    const onChange = e => {
        const regexp = /^[-+]?\d*\.?\d*$/;
        const numericInputs = ['factoredLoading', 'tributaryWidth', 'beamSpan', 'bearingLength', 'unsupportedLength', 'notchDepth'];
        if (numericInputs.indexOf(e.target.name) > -1) {
            if (e.target.value === '' || regexp.test(e.target.value)) {
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

    const handleHasNotch = e => {
        setHasNotch(!hasNotch);
        console.log(hasNotch);
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

    const computeKL = (_le) => {
        const _CB = Math.sqrt((_le * d) / (b ** 2));
        const _CK = Math.sqrt((0.97 * E * KSE * KT) / (fb * (KD * KH * KSb * KT)));
        if (_CB <= 10) {
            return 1;
        }
        else if (_CB <= 20) {
            return 1 - (1 / 3) * Math.pow((_CB / _CK), 4);
        }
        else {
            return (0.65 * E * KSE * KT) / ((_CB ** 2) * Fb);
        }
    }

    const computeKN = (alpha, eta) => {
        // const _A = ((1 / alpha) - 1);
        // const _B = ((1 / ((alpha) ** 3)) - 1);
        // const _C = (0.006 * d);
        const _KN = Math.pow(((0.006 * d) * (1.6 * ((1 / alpha) - 1) + ((eta ** 2) * ((1 / ((alpha) ** 3)) - 1)))), (-1 / 2));
        return _KN;
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
                <h1>Sawn Timber Beam</h1>
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
                        <label htmlFor="tributaryWidth">Tributary Width (mm)</label>
                        <input
                            name="tributaryWidth"
                            value={tributaryWidth} 
                            onChange={e => onChange(e)}
                            type="text" 
                            placeholder="Tributary Width" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="beamSpan">Beam Span (mm)</label>
                        <input
                            name="beamSpan"
                            value={beamSpan} 
                            onChange={e => onChange(e)}
                            type="text" 
                            placeholder="Beam Span" />
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
                        <label htmlFor="hasNotch">Has Notch?</label>
                        <input
                            type="checkbox"
                            checked={hasNotch}
                            onChange={ e => handleHasNotch(e)}
                        />
                    </div>
                    {
                        hasNotch && (
                            <div className="form-group">
                                <label htmlFor="notchDepth">Notch Depth (mm)</label>
                                <input
                                    name="notchDepth"
                                    value={notchDepth} 
                                    onChange={e => onChange(e)}
                                    type="text" 
                                    placeholder="Notch Depth" />
                            </div>
                        )
                    }
                    
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
                        <label htmlFor="sectionProperties">Section Properties <span><button onClick={handleSectionPropertiesInfo} className="info-button">i</button></span></label>
                        <select
                            name="sectionProperties"
                            value={sectionProperties}
                            onChange={e => onChange(e)}>
                                { sections.map((option, index)=> <option key={index}>{option}</option>) }
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
                                    <p>b = {b} mm<span className="ml-2"> cross-sectional width</span></p>
                                    <p>d = {d}  mm<span className="ml-2"> cross-sectional depth</span></p>
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
                                    <p><Tex>{`M_f = \\dfrac{\\text{ factored loading } \\cdot \\text{ joist spacing } \\cdot l_n^2}{8}  `}</Tex></p>
                                    <p><Tex>{`M_f = ${Mf.toFixed(2)} \\text{ kN-m }`}</Tex></p>
                                    <p><Tex>{`V_f = \\dfrac{\\text{ factored loading } \\cdot \\text{ joist spacing } \\cdot l_n}{2} \\cdot \\Big( 1 - \\dfrac{(d - d_n) + d}{l_n} \\Big)  `}</Tex></p>
                                    <p><Tex>{`V_f = ${Vf.toFixed(2)} \\text{ kN }`}</Tex></p>
                                    <p><Tex>{`Q_f = \\dfrac{\\text{ factored loading } \\cdot \\text{ joist spacing } \\cdot l_n}{2}  `}</Tex></p>
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
                                    <p><Tex>{`\\phi_f=${phi_f}`}</Tex><span className="ml-3"> resistance factor for fracture shear resistance</span></p>
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
                                    Service Condition Factors - {serviceCondition} -  (CSA 086 Table 6.4.2)
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
                                    Cross-sectional Area
                                </div>
                                <div className="card-text">
                                    <p><Tex>{`d_n \\leq 0.25 \\cdot d `}</Tex><span className='ml-3'>notch depth</span></p>
                                    <p><Tex>{`d_n = ${dn.toFixed(2)} \\text{ mm} `}</Tex></p>
                                    <p><Tex>{`A_n = b \\cdot (d - d_n) `}</Tex><span className='ml-3'>net cross-sectional area</span></p>
                                    <p><Tex>{`A_n = ${An.toFixed(0)} \\text{ mm}^2`}</Tex></p>
                                </div>
                            </div>
                        </div>
                        <div className="info-card info-card-primary">
                            <div className="card-body">
                                <div className="card-title">
                                    Section Modulus
                                </div>
                                <div className="card-text">
                                    <p><Tex>{`S = \\dfrac{b \\cdot d^2}{6}`}</Tex></p>
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
                                    <p><Tex>{`M_r = \\phi_b \\cdot F_b \\cdot S \\cdot K_{Zb} \\cdot K_L `}</Tex></p>
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
                        { hasNotch && (
                             <div className="info-card info-card-primary">
                                <div className="card-body">
                                    <div className="card-title">
                                        Fracture Shear Resistance (CSA 086 Cl. 6.5.5.3)
                                    </div>
                                    <div className="card-text">
                                        <p><Tex>{`e = \\dfrac{\\text{Br}_{\\text{length}}}{2} + 2 `}</Tex></p>
                                        <p><Tex>{`e = ${e.toFixed(2)} \\text{ mm} `}</Tex></p>
                                        <p><Tex>{`\\alpha = 1 - \\dfrac{d_n}{d} `}</Tex></p>
                                        <p><Tex>{`\\alpha = ${alpha.toFixed(2)} `}</Tex></p>
                                        <p><Tex>{`F_f = f_f \\cdot K_D \\cdot K_H \\cdot K_{Sf} \\cdot K_T`}</Tex></p>
                                        <p><Tex>{`F_f = ${Ff.toFixed(2)} \\text{ MPa}`}</Tex></p>
                                        <p><Tex>{`\\eta = \\dfrac{e}{d} `}</Tex></p>
                                        <p><Tex>{`\\eta = ${eta.toFixed(2)} `}</Tex></p>
                                        <p><Tex>{`K_N = {\\Big( 0.006 \\cdot d \\Big( 1.6 \\cdot \\Big( \\dfrac{1}{\\alpha} - 1 \\Big) + {\\eta}^2 \\Big( \\dfrac{1}{{\\alpha}^3} - 1 \\Big)  \\Big) \\Big)}^{- \\frac{1}{2}}  `}</Tex></p>
                                        <p><Tex>{`K_N = ${KN.toFixed(2)}  `}</Tex></p>
                                        <p><Tex>{`A_g = n \\cdot b \\cdot d`}</Tex></p>
                                        <p><Tex>{`A_g = ${ (b * d).toFixed(2) } \\text{ mm}^2`}</Tex></p>
                                        <p><Tex>{`F_r = \\phi_f \\cdot F_f \\cdot A_g \\cdot K_N   `}</Tex></p>
                                        <p><Tex>{`F_r = ${Fr.toFixed(2)} \\text{ kN}`}</Tex></p>
                                    </div>
                                </div>
                            </div>
                        )}
                       {
                           Qr > 0 && (
                                <div className="info-card info-card-primary">
                                    <div className="card-body">
                                        <div className="card-title">
                                            Bearing Resistance (CSA 086 Cl. 6.5.7.2)
                                        </div>
                                        <div className="card-text">
                                            <p><Tex>{`\\text{Br}_{\\text{width}} = b`}</Tex><span className='ml-3'>bearing width</span></p>
                                            <p><Tex>{`\\text{Br}_{\\text{width}} = ${(b).toFixed(2)} \\text{ mm}`}</Tex></p>
                                            <p><Tex>{`\\text{Br}_{\\text{length}} = ${bearingLength} \\text{ mm}`}</Tex><span className='ml-3'>bearing length</span></p>
                                            <p><Tex>{`A_b = \\text{Br}_{\\text{width}} \\cdot \\text{Br}_{\\text{length}} `}</Tex><span className='ml-3'>bearing area</span></p>
                                            <p><Tex>{`A_b = ${(b * bearingLength).toFixed(2)} \\text{ mm}^2 `}</Tex></p>
                                            <p><Tex>{`Q_r = \\phi_{cp} \\cdot F_{cp} \\cdot (K_D \\cdot K_{Sp} \\cdot K_T) \\cdot A_b \\cdot K_B \\cdot K_{Zcp}  `}</Tex></p>
                                            <p><Tex>{`Q_r = ${Qr.toFixed(2)} \\text{ kN}`}</Tex></p>
                                        </div>
                                    </div>
                                </div>
                           )
                       }
                        
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
                                    {
                                        Qr > 0 && (
                                            <Fragment>
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
                                            </Fragment>   
                                        )
                                    }
                                    
                                    {
                                        hasNotch && (
                                            <Fragment>
                                                <p>Shear Fracture Capacity Check</p>
                                                <p><Tex>{`Q_f = ${Qf.toFixed(2)} \\text{ kN }`}</Tex></p>
                                                <p><Tex>{`F_r = ${Fr.toFixed(2)} \\text{ kN}`}</Tex></p>
                                                <p className={shearFractureCheck >= 1 ? 'text-danger' : 'text-success'}>
                                                    <Tex>{`DC_{ratio} = ${shearFractureCheck.toFixed(2)}`}</Tex>
                                                    {
                                                        shearFractureCheck >=1 ? (
                                                            <span className="text-danger">  NOT OK</span>
                                                        ): 
                                                        (
                                                            <span className="text-success"> OK</span>
                                                        )
                                                    }
                                                </p>
                                            </Fragment>    
                                        )
                                    }
                                   
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
                                    <p><Tex>{`I = n \\cdot \\dfrac{b \\cdot d^3}{12} `}</Tex></p>
                                    <p><Tex>{`I = ${I.toExponential(2)} \\text{ mm}^4 `}</Tex></p>
                                    <p><Tex>{`E{_s}I = E \\cdot (K_{SE} \\cdot K_T) \\cdot I `}</Tex></p>
                                    <p><Tex>{`E{_s}I =  ${EsI.toExponential(2)} \\text{ N} \\cdot \\text{mm}^2`}</Tex></p>
                                    <p><Tex>{`\\Delta = \\dfrac{ 5 \\cdot \\text{service load} \\cdot \\text{joist spacing} \\cdot l_{n}^4 }{ 384 \\cdot E_s \\cdot I}`}</Tex></p>
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

export default SawnTimberBeam
