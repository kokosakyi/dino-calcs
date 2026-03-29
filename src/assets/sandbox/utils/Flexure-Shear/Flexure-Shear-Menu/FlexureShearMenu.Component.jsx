import React from 'react';

import CardMenu from './../../CardMenu/CardMenu.Component';

const FlexureShearMenu = ({ match }) => {
    return (
        <React.Fragment>
            <CardMenu heading="Joist Design" imageUrl="/img/flexure-design.jpg" setUrl={`${match.url}joist-design/`} />
            <CardMenu heading="Built-up Beam" imageUrl="/img/flexure-design.jpg" setUrl={`${match.url}built-up-beam/`} />
            <CardMenu heading="Sawn Timber Beam" imageUrl="/img/flexure-design.jpg" setUrl={`${match.url}sawn-timber-beam/`} />
            <CardMenu heading="Biaxial Bending" imageUrl="/img/flexure-design.jpg" setUrl={`${match.url}biaxial-bending/`} />
        </React.Fragment>
    )
}

export default FlexureShearMenu;