package Freshora.Backend.config;

import java.util.Arrays;

import org.springframework.beans.factory.config.BeanDefinition;
import org.springframework.beans.factory.config.BeanFactoryPostProcessor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration(proxyBeanMethods = false)
public class FlywayBeforeJpaConfig {

    @Bean
    static BeanFactoryPostProcessor flywayBeforeJpaBeanFactoryPostProcessor() {
        return beanFactory -> {
            if (!beanFactory.containsBeanDefinition("flywayInitializer")
                    || !beanFactory.containsBeanDefinition("entityManagerFactory")) {
                return;
            }

            BeanDefinition entityManagerFactory =
                    beanFactory.getBeanDefinition("entityManagerFactory");
            String[] existingDependencies = entityManagerFactory.getDependsOn();
            if (existingDependencies != null
                    && Arrays.asList(existingDependencies).contains("flywayInitializer")) {
                return;
            }

            String[] dependencies = existingDependencies == null
                    ? new String[1]
                    : Arrays.copyOf(existingDependencies, existingDependencies.length + 1);
            dependencies[dependencies.length - 1] = "flywayInitializer";
            entityManagerFactory.setDependsOn(dependencies);
        };
    }
}
