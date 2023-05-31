import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'

import { persistor, store } from 'state'

import App from 'pages/App'

import EtherProvider from 'containers/EtherProvider'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <EtherProvider>
        <App />
      </EtherProvider>
    </PersistGate>
  </Provider>,
)
