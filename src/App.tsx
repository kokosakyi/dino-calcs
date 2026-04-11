import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { MathJaxContext } from 'better-react-mathjax';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { SteelHome } from './pages/SteelHome';
import { ConcreteHome } from './pages/ConcreteHome';
import { ConcreteBeamDesign } from './pages/concrete/ConcreteBeamDesign';
import { ConcreteSlabDesign } from './pages/concrete/ConcreteSlabDesign';
import { ConcreteFootingDesign } from './pages/concrete/ConcreteFootingDesign';
import { WoodHome } from './pages/WoodHome';
import { WoodJoistDesign } from './pages/wood/WoodJoistDesign';
import { WoodBuiltUpBeam } from './pages/wood/WoodBuiltUpBeam';
import { WoodSawnTimberBeam } from './pages/wood/WoodSawnTimberBeam';
import { WoodBiaxialBending } from './pages/wood/WoodBiaxialBending';
import { BeamDesign } from './pages/BeamDesign';
import { ChannelBeamDesign } from './pages/ChannelBeamDesign';
import { SBeamDesign } from './pages/SBeamDesign';
import { AngleBeamDesign } from './pages/AngleBeamDesign';
import { SectionCapacity } from './pages/SectionCapacity';
import { ChannelCapacity } from './pages/ChannelCapacity';
import { SCapacity } from './pages/SCapacity';
import { AngleCapacity } from './pages/AngleCapacity';
import { SectionBrowser } from './pages/SectionBrowser';
import { ColumnDesign } from './pages/ColumnDesign';
import { BaseplateDesign } from './pages/BaseplateDesign';
import { StructuralAnalysis } from './pages/StructuralAnalysis';
import './App.css';

const mathJaxConfig = {
  loader: { load: ['input/tex', 'output/chtml'] },
  tex: {
    inlineMath: [['\\(', '\\)']],
    displayMath: [['\\[', '\\]']],
  },
  chtml: {
    matchFontHeight: true,
    mtextInheritFont: true,
  },
};

function App() {
  return (
    <ThemeProvider>
      <MathJaxContext config={mathJaxConfig}>
        <BrowserRouter>
          <Routes>
            <Route path="/analysis" element={<StructuralAnalysis />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />

              {/* Steel Design - CSA S16-19 */}
              <Route path="steel">
                <Route index element={<SteelHome />} />
                <Route path="beam-design" element={<BeamDesign />} />
                <Route path="channel-beam-design" element={<ChannelBeamDesign />} />
                <Route path="s-beam-design" element={<SBeamDesign />} />
                <Route path="angle-beam-design" element={<AngleBeamDesign />} />
                <Route path="section-capacity" element={<SectionCapacity />} />
                <Route path="channel-capacity" element={<ChannelCapacity />} />
                <Route path="s-capacity" element={<SCapacity />} />
                <Route path="angle-capacity" element={<AngleCapacity />} />
                <Route path="column-design" element={<ColumnDesign />} />
                <Route path="baseplate-design" element={<BaseplateDesign />} />
                <Route path="section-browser" element={<SectionBrowser />} />
              </Route>

              {/* Concrete Design - CSA A23.3 */}
              <Route path="concrete">
                <Route index element={<ConcreteHome />} />
                <Route path="beam-design" element={<ConcreteBeamDesign />} />
                <Route path="slab-design" element={<ConcreteSlabDesign />} />
                <Route path="footing-design" element={<ConcreteFootingDesign />} />
              </Route>

              {/* Wood Design - CSA O86 */}
              <Route path="wood">
                <Route index element={<WoodHome />} />
                <Route path="joist-design" element={<WoodJoistDesign />} />
                <Route path="built-up-beam" element={<WoodBuiltUpBeam />} />
                <Route path="sawn-timber-beam" element={<WoodSawnTimberBeam />} />
                <Route path="biaxial-bending" element={<WoodBiaxialBending />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </MathJaxContext>
    </ThemeProvider>
  );
}

export default App;
