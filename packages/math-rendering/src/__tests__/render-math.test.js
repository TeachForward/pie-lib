import React from 'react';
import { mount } from 'enzyme';
import renderMath, { fixMathElement } from '../render-math';
import { mathjax } from 'mathjax-full/js/mathjax';

jest.mock(
  'mathjax-full/js/mathjax',
  () => ({
    mathjax: {
      document: jest.fn().mockReturnThis(),
      findMath: jest.fn().mockReturnThis(),
      compile: jest.fn().mockReturnThis(),
      getMetrics: jest.fn().mockReturnThis(),
      typeset: jest.fn().mockReturnThis(),
      updateDocument: jest.fn().mockReturnThis(),
      clear: jest.fn().mockReturnThis()
    }
  }),
  {
    virtual: true
  }
);

jest.mock('mathjax-full/js/input/mathml', () => ({
  MathML: jest.fn()
}));

jest.mock('mathjax-full/js/input/tex', () => ({
  TeX: jest.fn()
}));

jest.mock('mathjax-full/js/output/chtml', () => ({
  CHTML: jest.fn()
}));

jest.mock('mathjax-full/js/adaptors/browserAdaptor', () => ({
  browserAdaptor: jest.fn()
}));

jest.mock('mathjax-full/js/handlers/html', () => ({
  RegisterHTMLHandler: jest.fn()
}));

describe.only('render-math', () => {
  it('calls MathJax render', () => {
    const div = document.createElement('div');
    renderMath(div);
    expect(mathjax.document).toHaveBeenCalledTimes(1);
    expect(mathjax.findMath).toHaveBeenCalledWith({ elements: [div] });
  });

  it('call render math for an array of elements', () => {
    const divOne = document.createElement('div');
    const divTwo = document.createElement('div');

    renderMath([divOne, divTwo]);

    expect(mathjax.document).toHaveBeenCalledTimes(1);
    expect(mathjax.findMath).toHaveBeenCalledWith({
      elements: [divOne, divTwo]
    });
  });

  it('wraps the math containing element the right way', () => {
    const wrapper = mount(
      <div>
        <span data-latex="">{'420\\text{ cm}=4.2\\text{ meters}'}</span>
      </div>
    );
    const spanElem = wrapper.instance();

    fixMathElement(spanElem);

    expect(spanElem.textContent).toEqual('\\(420\\text{ cm}=4.2\\text{ meters}\\)');
  });
});
