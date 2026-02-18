import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { MathJaxContext } from 'better-react-mathjax';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { BeamDesign } from './pages/BeamDesign';
import { ChannelBeamDesign } from './pages/ChannelBeamDesign';
import { SBeamDesign } from './pages/SBeamDesign';
import { SectionCapacity } from './pages/SectionCapacity';
import { ChannelCapacity } from './pages/ChannelCapacity';
import { SCapacity } from './pages/SCapacity';
import { SectionBrowser } from './pages/SectionBrowser';
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
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="steel">
                <Route path="beam-design" element={<BeamDesign />} />
                <Route path="channel-beam-design" element={<ChannelBeamDesign />} />
                <Route path="s-beam-design" element={<SBeamDesign />} />
                <Route path="section-capacity" element={<SectionCapacity />} />
                <Route path="channel-capacity" element={<ChannelCapacity />} />
                <Route path="s-capacity" element={<SCapacity />} />
                <Route path="section-browser" element={<SectionBrowser />} />
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
